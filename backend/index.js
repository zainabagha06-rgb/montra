// index.js
// This is the entry point of our backend server.

require('dotenv').config();

// ---- All requires grouped together at the top ----
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// ---- App setup ----
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '15mb' }));   // allows image data in product requests
// ---- Middleware: checks for a valid token before allowing access ----
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
// Middleware: checks that the logged-in user is an admin
// Must run AFTER requireAuth, since it needs req.userId to already be set
async function requireAdmin(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
// ---- Basic route ----
app.get('/', (req, res) => {
  res.send('MONTRA backend is running!');
});

// ---- Auth routes ----

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are all required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong creating the account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

res.json({ token, user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } });  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong logging in' });
  }
});

app.get('/api/account/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/account/orders — the logged-in customer's order history
app.get('/api/account/orders', requireAuth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },       // only THIS user's orders
      orderBy: { createdAt: 'desc' },      // newest first
      include: {
        items: {
          include: {
            // pull in the product so the page can show its name and image
            product: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching your orders' });
  }
});

// ---- Product routes ----

app.get('/api/products', async (req, res) => {
  try {
    const { collection, category, ageGroup, isBestSeller, isNewArrival, eventTag } = req.query;

    const where = {};
    if (collection) where.collection = collection;
    if (category) where.category = category;
    if (ageGroup) where.ageGroup = ageGroup;
    if (eventTag) where.eventTag = eventTag;
    if (isBestSeller) where.isBestSeller = isBestSeller === 'true';
    if (isNewArrival) where.isNewArrival = isNewArrival === 'true';

    const products = await prisma.product.findMany({ where });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching the product' });
  }
});

// ---- Admin: Product management ----

// POST /api/admin/products — create a new product
app.post('/api/admin/products', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, oldPrice, image, category, collection, ageGroup, stock, eventTag, isBestSeller, isNewArrival, sizes, colors, colorImages } = req.body;

    if (!name || !description || !price || !image || !category || !collection || !ageGroup) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    const product = await prisma.product.create({
      data: {
        name, description, price, oldPrice, image, category, collection, ageGroup,
        stock: stock || 0,
        eventTag,
        isBestSeller: !!isBestSeller,
        isNewArrival: !!isNewArrival,
        sizes: sizes || undefined,
        colors: colors || undefined,
        colorImages: colorImages || undefined,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong creating the product' });
  }
});

// PUT /api/admin/products/:id — update an existing product
app.put('/api/admin/products/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong updating the product' });
  }
});

// DELETE /api/admin/products/:id — delete a product
app.delete('/api/admin/products/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong deleting the product' });
  }
});

// ---- Admin: Orders and customers ----

// GET /api/admin/orders: every order, newest first
app.get('/api/admin/orders', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        // who placed it (never include the password field)
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching orders' });
  }
});

// PATCH /api/admin/orders/:id: change an order's status
app.patch('/api/admin/orders/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    // only allow statuses we actually use, so typos can't sneak in
    const allowed = ['paid', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong updating the order' });
  }
});

// GET /api/admin/customers: all customers with how many orders each has
app.get('/api/admin/customers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { orders: true } }, // number of orders
      },
    });
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching customers' });
  }
});

// ---- Cart routes ----

app.post('/api/cart', requireAuth, async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: req.userId,
        productId,
        quantity: quantity || 1,
        size,
        color,
      },
    });

    res.status(201).json(cartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong adding to cart' });
  }
});

app.get('/api/cart', requireAuth, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { product: true },
    });
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching your cart' });
  }
});

app.delete('/api/cart/:id', requireAuth, async (req, res) => {
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!cartItem || cartItem.userId !== req.userId) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: cartItem.id } });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong removing the item' });
  }
});

// ---- Wishlist routes ----

// GET /api/wishlist: the logged-in customer's saved products
app.get('/api/wishlist', requireAuth, async (req, res) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching your wishlist' });
  }
});

// POST /api/wishlist: save a product (saving it twice does nothing)
app.post('/api/wishlist', requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.body.productId);
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    // upsert = "create it, unless it already exists"
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: req.userId, productId } },
      update: {},
      create: { userId: req.userId, productId },
    });

    res.status(201).json({ message: 'Saved to wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong saving to your wishlist' });
  }
});

// DELETE /api/wishlist/:productId: remove a saved product
app.delete('/api/wishlist/:productId', requireAuth, async (req, res) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.userId, productId: parseInt(req.params.productId) },
    });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong removing it' });
  }
});

// ---- Checkout route ----

app.post('/api/checkout', requireAuth, async (req, res) => {
  try {
    // The frontend now sends shipping details along with the checkout request
    const { shippingName, phone, address, city, postalCode, country } = req.body;

    // Without these the client can't actually deliver the order, so they're required
    if (!shippingName || !phone || !address || !city || !country) {
      return res.status(400).json({ error: 'Please fill in all shipping details' });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId: req.userId,
        total,
        status: 'paid',
        // save the shipping details on the order itself
        shippingName,
        phone,
        address,
        city,
        postalCode,
        country,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // price at the time of purchase
            size: item.size,           // keep the size the customer picked
            color: item.color,         // keep the color the customer picked
          })),
        },
      },
      include: { items: true },
    });

    // empty the cart now that the order is placed
    await prisma.cartItem.deleteMany({ where: { userId: req.userId } });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during checkout' });
  }
});

// ---- Start server ----
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});