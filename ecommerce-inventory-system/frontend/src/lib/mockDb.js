// client-side reactive localStorage database for DSA mini-project demo

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Laptop",
    category: "Electronics",
    basePrice: 999.99,
    price: 1099.99,
    popularity: 85,
    stock: 50,
    maxStock: 150,
    rating: 4.8,
    turnoverRate: 0.65,
    expiryDate: "2028-12-31",
  },
  {
    id: 2,
    name: "Mouse",
    category: "Electronics",
    basePrice: 29.99,
    price: 32.99,
    popularity: 90,
    stock: 200,
    maxStock: 300,
    rating: 4.3,
    turnoverRate: 0.85,
    expiryDate: "2029-01-01",
  },
  {
    id: 3,
    name: "Keyboard",
    category: "Electronics",
    basePrice: 79.99,
    price: 87.99,
    popularity: 88,
    stock: 150,
    maxStock: 250,
    rating: 4.5,
    turnoverRate: 0.72,
    expiryDate: "2027-08-15",
  },
  {
    id: 4,
    name: "Monitor",
    category: "Electronics",
    basePrice: 349.99,
    price: 349.99,
    popularity: 75,
    stock: 80,
    maxStock: 200,
    rating: 4.6,
    turnoverRate: 0.55,
    expiryDate: "2029-06-30",
  },
  {
    id: 5,
    name: "Headphones",
    category: "Electronics",
    basePrice: 149.99,
    price: 164.99,
    popularity: 82,
    stock: 120,
    maxStock: 200,
    rating: 4.2,
    turnoverRate: 0.6,
    expiryDate: "2028-10-10",
  },
  {
    id: 6,
    name: "T-Shirt",
    category: "Clothing",
    basePrice: 19.99,
    price: 11.99,
    popularity: 95,
    stock: 300,
    maxStock: 500,
    rating: 4.7,
    turnoverRate: 0.95,
    expiryDate: "2026-08-01",
  },
  {
    id: 7,
    name: "Jeans",
    category: "Clothing",
    basePrice: 59.99,
    price: 65.99,
    popularity: 80,
    stock: 180,
    maxStock: 250,
    rating: 4.1,
    turnoverRate: 0.7,
    expiryDate: "2030-01-01",
  },
  {
    id: 8,
    name: "Jacket",
    category: "Clothing",
    basePrice: 89.99,
    price: 76.49,
    popularity: 50,
    stock: 100,
    maxStock: 150,
    rating: 4.0,
    turnoverRate: 0.45,
    expiryDate: "2026-11-30",
  },
  {
    id: 9,
    name: "Sneakers",
    category: "Footwear",
    basePrice: 129.99,
    price: 142.99,
    popularity: 88,
    stock: 150,
    maxStock: 200,
    rating: 4.9,
    turnoverRate: 0.8,
    expiryDate: "2029-05-15",
  },
  {
    id: 10,
    name: "Boots",
    category: "Footwear",
    basePrice: 159.99,
    price: 135.99,
    popularity: 45,
    stock: 90,
    maxStock: 120,
    rating: 4.4,
    turnoverRate: 0.4,
    expiryDate: "2028-04-20",
  },
];

const INITIAL_WAREHOUSES = [
  {
    id: 1,
    name: "Main Warehouse",
    location: "Central Hub",
    totalStock: 335,
    capacity: 10000,
    status: "Active",
    inventory: [
      { productId: 1, name: "Laptop", quantity: 25 },
      { productId: 2, name: "Mouse", quantity: 80 },
      { productId: 3, name: "Keyboard", quantity: 60 },
      { productId: 6, name: "T-Shirt", quantity: 120 },
      { productId: 9, name: "Sneakers", quantity: 50 },
    ],
  },
  {
    id: 2,
    name: "East Coast Hub",
    location: "New York",
    totalStock: 215,
    capacity: 8000,
    status: "Active",
    inventory: [
      { productId: 1, name: "Laptop", quantity: 15 },
      { productId: 2, name: "Mouse", quantity: 70 },
      { productId: 5, name: "Headphones", quantity: 50 },
      { productId: 6, name: "T-Shirt", quantity: 80 },
    ],
  },
  {
    id: 3,
    name: "West Coast Hub",
    location: "California",
    totalStock: 165,
    capacity: 7500,
    status: "Active",
    inventory: [
      { productId: 3, name: "Keyboard", quantity: 40 },
      { productId: 4, name: "Monitor", quantity: 30 },
      { productId: 9, name: "Sneakers", quantity: 50 },
      { productId: 10, name: "Boots", quantity: 45 },
    ],
  },
];

const INITIAL_CUSTOMERS = [
  {
    id: 1,
    name: "John Doe",
    isLoyaltyMember: true,
    registrationDate: "2026-02-14",
    purchaseHistory: [
      "Invoice #8241 - 1x Laptop (₹999.99) 2x Mouse (₹29.99) | Subtotal: ₹1059.97 | Discount: ₹105.99 | Tax: ₹76.32 | Total Paid: ₹1030.30",
      "Invoice #4129 - 1x Headphone (₹149.99) | Subtotal: ₹149.99 | Discount: ₹15.00 | Tax: ₹10.80 | Total Paid: ₹145.79",
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    isLoyaltyMember: false,
    registrationDate: "2026-04-01",
    purchaseHistory: [
      "Invoice #3928 - 1x Sneakers (₹129.99) | Subtotal: ₹129.99 | Discount: ₹0.00 | Tax: ₹10.40 | Total Paid: ₹140.39",
    ],
  },
  {
    id: 3,
    name: "Bob Wilson",
    isLoyaltyMember: true,
    registrationDate: "2026-05-10",
    purchaseHistory: [
      "Invoice #1209 - 3x T-Shirt (₹19.99) | Subtotal: ₹59.97 | Discount: ₹6.00 | Tax: ₹4.32 | Total Paid: ₹58.29",
    ],
  },
  {
    id: 4,
    name: "Alice Brown",
    isLoyaltyMember: false,
    registrationDate: "2026-05-20",
    purchaseHistory: [],
  },
];

const INITIAL_QUEUE = [
  {
    id: 1,
    name: "John Doe",
    isLoyaltyMember: true,
    cartTotal: 1029.97,
    items: 3,
    waitTime: "2 min",
  },
  {
    id: 2,
    name: "Jane Smith",
    isLoyaltyMember: false,
    cartTotal: 159.99,
    items: 2,
    waitTime: "5 min",
  },
  {
    id: 3,
    name: "Bob Wilson",
    isLoyaltyMember: true,
    cartTotal: 89.99,
    items: 1,
    waitTime: "8 min",
  },
  {
    id: 4,
    name: "Alice Brown",
    isLoyaltyMember: false,
    cartTotal: 299.99,
    items: 4,
    waitTime: "12 min",
  },
];

// Helper to interact with LocalStorage
function getItem(key, initial) {
  if (typeof window === "undefined") return initial;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : initial;
  } catch (e) {
    return initial;
  }
}

function setItem(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* ignore */
  }
}

// Initialise DB
export function initDb() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("db_products")) {
    setItem("db_products", INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem("db_warehouses")) {
    setItem("db_warehouses", INITIAL_WAREHOUSES);
  }
  if (!localStorage.getItem("db_customers")) {
    setItem("db_customers", INITIAL_CUSTOMERS);
  }
  if (!localStorage.getItem("db_queue")) {
    setItem("db_queue", INITIAL_QUEUE);
  }
  if (!localStorage.getItem("cartItems")) {
    setItem("cartItems", []);
  }
}

// Simulate brief server delay for realism
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// PRODUCTS CRUD (BST simulation)
export const productsDb = {
  getAll: async () => {
    initDb();
    await delay(300);
    return getItem("db_products", INITIAL_PRODUCTS);
  },
  create: async (productData) => {
    initDb();
    await delay(400);
    const products = getItem("db_products", INITIAL_PRODUCTS);
    const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct = {
      id: nextId,
      name: productData.name,
      category: productData.category,
      basePrice: Number(productData.price),
      price: Number(productData.price),
      popularity: productData.popularity || 50,
      stock: Number(productData.stock) || 0,
      maxStock: Number(productData.maxStock) || 100,
      rating: 4.0,
      turnoverRate: 0.5,
      expiryDate: productData.expiryDate || "2029-01-01",
    };
    const updated = [...products, newProduct];
    setItem("db_products", updated);

    // Also auto-add to the Main Warehouse (Hub 1)
    const warehouses = getItem("db_warehouses", INITIAL_WAREHOUSES);
    const updatedWH = warehouses.map((w) => {
      if (w.id === 1) {
        const inv = [...w.inventory, { productId: nextId, name: newProduct.name, quantity: newProduct.stock }];
        return {
          ...w,
          inventory: inv,
          totalStock: inv.reduce((sum, item) => sum + item.quantity, 0),
        };
      }
      return w;
    });
    setItem("db_warehouses", updatedWH);

    return newProduct;
  },
  update: async (id, updates) => {
    initDb();
    await delay(350);
    const products = getItem("db_products", INITIAL_PRODUCTS);
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setItem("db_products", updated);
    return updated.find((p) => p.id === id);
  },
  delete: async (id) => {
    initDb();
    await delay(400);
    const products = getItem("db_products", INITIAL_PRODUCTS);
    setItem("db_products", products.filter((p) => p.id !== id));

    // Also remove from all warehouses
    const warehouses = getItem("db_warehouses", INITIAL_WAREHOUSES);
    const updatedWH = warehouses.map((w) => {
      const inv = w.inventory.filter((item) => item.productId !== id);
      return {
        ...w,
        inventory: inv,
        totalStock: inv.reduce((sum, item) => sum + item.quantity, 0),
      };
    });
    setItem("db_warehouses", updatedWH);
    return true;
  },
};

// WAREHOUSES & SUPPLY CHAIN GRAPH ROUTING
export const warehousesDb = {
  getAll: async () => {
    initDb();
    await delay(300);
    return getItem("db_warehouses", INITIAL_WAREHOUSES);
  },
  create: async (whData) => {
    initDb();
    await delay(450);
    const warehouses = getItem("db_warehouses", INITIAL_WAREHOUSES);
    const nextId = warehouses.length ? Math.max(...warehouses.map((w) => w.id)) + 1 : 1;
    const newWh = {
      id: nextId,
      name: whData.name,
      location: whData.location,
      capacity: Number(whData.capacity),
      totalStock: 0,
      status: "Active",
      inventory: [],
    };
    const updated = [...warehouses, newWh];
    setItem("db_warehouses", updated);
    return newWh;
  },
  delete: async (id) => {
    initDb();
    await delay(400);
    const warehouses = getItem("db_warehouses", INITIAL_WAREHOUSES);
    setItem("db_warehouses", warehouses.filter((w) => w.id !== id));
    return true;
  },
  transfer: async (fromId, toId, productId, qty) => {
    initDb();
    await delay(500);
    const warehouses = getItem("db_warehouses", INITIAL_WAREHOUSES);
    const products = getItem("db_products", INITIAL_PRODUCTS);
    const p = products.find((prod) => prod.id === productId);
    const pName = p ? p.name : `Product ${productId}`;

    const updated = warehouses.map((w) => {
      if (w.id === fromId) {
        const inv = w.inventory.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity - qty) } : i
        ).filter((i) => i.quantity > 0);
        return {
          ...w,
          inventory: inv,
          totalStock: inv.reduce((sum, item) => sum + item.quantity, 0),
        };
      }
      if (w.id === toId) {
        const exists = w.inventory.find((i) => i.productId === productId);
        let inv = [];
        if (exists) {
          inv = w.inventory.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + qty } : i
          );
        } else {
          inv = [...w.inventory, { productId, name: pName, quantity: qty }];
        }
        return {
          ...w,
          inventory: inv,
          totalStock: inv.reduce((sum, item) => sum + item.quantity, 0),
        };
      }
      return w;
    });

    setItem("db_warehouses", updated);
    return { success: true };
  },
  shortestPath: async (fromId, toId, algo) => {
    initDb();
    await delay(350);

    // Build the warehouse routing graph
    // Vertices: 1 (Main), 2 (East Coast), 3 (West Coast)
    // Mileage edges:
    // 1 <-> 2: 1000 miles
    // 1 <-> 3: 2000 miles
    // 2 <-> 3: no direct connection (forces route through 1: distance 3000 miles)
    const graph = {
      1: { 2: 1000, 3: 2000 },
      2: { 1: 1000 },
      3: { 1: 2000 },
    };

    const namesMap = {
      1: "Main Warehouse",
      2: "East Coast Hub",
      3: "West Coast Hub",
    };

    // If dynamically added warehouses exist, connect them to Main Warehouse (Hub 1)
    const warehouses = getItem("db_warehouses", INITIAL_WAREHOUSES);
    warehouses.forEach((w) => {
      if (!graph[w.id]) {
        graph[w.id] = { 1: 1500 };
        graph[1][w.id] = 1500;
        namesMap[w.id] = w.name;
      }
    });

    const start = Number(fromId);
    const end = Number(toId);

    // BFS solver (shortest hops)
    const bfsSolve = () => {
      const queue = [[start]];
      const visited = new Set([start]);
      while (queue.length > 0) {
        const path = queue.shift();
        const node = path[path.length - 1];
        if (node === end) return path;
        const neighbors = Object.keys(graph[node] || {}).map(Number);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push([...path, neighbor]);
          }
        }
      }
      return [start, end];
    };

    // DFS solver (depth traversal search)
    const dfsSolve = () => {
      const stack = [[start]];
      const visited = new Set();
      while (stack.length > 0) {
        const path = stack.pop();
        const node = path[path.length - 1];
        if (node === end) return path;
        if (!visited.has(node)) {
          visited.add(node);
          const neighbors = Object.keys(graph[node] || {}).map(Number);
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              stack.push([...path, neighbor]);
            }
          }
        }
      }
      return [start, end];
    };

    // Dijkstra solver (lowest mileage routing weight)
    const dijkstraSolve = () => {
      const distances = {};
      const previous = {};
      const queue = new Set();

      Object.keys(graph).forEach((node) => {
        distances[node] = Infinity;
        previous[node] = null;
        queue.add(Number(node));
      });
      distances[start] = 0;

      while (queue.size > 0) {
        let minNode = null;
        queue.forEach((node) => {
          if (minNode === null || distances[node] < distances[minNode]) {
            minNode = node;
          }
        });

        if (minNode === null || distances[minNode] === Infinity) break;
        if (minNode === end) break;

        queue.delete(minNode);

        const neighbors = graph[minNode] || {};
        Object.keys(neighbors).forEach((neighbor) => {
          const alt = distances[minNode] + neighbors[neighbor];
          const neighborNum = Number(neighbor);
          if (alt < distances[neighborNum]) {
            distances[neighborNum] = alt;
            previous[neighborNum] = minNode;
          }
        });
      }

      const path = [];
      let current = end;
      while (current !== null) {
        path.unshift(current);
        current = previous[current];
      }
      return { path, distance: distances[end] };
    };

    let selectedPath = [];
    let distance = 0;

    if (algo === "BFS") {
      selectedPath = bfsSolve();
      // Calculate mileage for the path
      for (let i = 0; i < selectedPath.length - 1; i++) {
        distance += graph[selectedPath[i]][selectedPath[i + 1]] || 0;
      }
    } else if (algo === "DFS") {
      selectedPath = dfsSolve();
      for (let i = 0; i < selectedPath.length - 1; i++) {
        distance += graph[selectedPath[i]][selectedPath[i + 1]] || 0;
      }
    } else {
      // Dijkstra
      const res = dijkstraSolve();
      selectedPath = res.path;
      distance = res.distance === Infinity ? 2500 : res.distance;
    }

    const visitedNames = selectedPath.map((id) => namesMap[id] || `Hub ${id}`);

    return {
      success: true,
      method:
        algo === "BFS"
          ? "BFS (Shortest Hops)"
          : algo === "DFS"
            ? "DFS (Depth Traversal)"
            : "Dijkstra (Lowest Mileage)",
      distance,
      path: selectedPath,
      visited: visitedNames,
      costs: {
        cargoTruck: distance * 0.15,
        expressCourier: distance * 0.45,
        airFreight: distance * 1.2,
      },
    };
  },
};

// CART & CHECKOUT QUEUE (Stack + Priority Queue)
export const cartDb = {
  get: async () => {
    initDb();
    await delay(200);
    return getItem("cartItems", []);
  },
  add: async (productId, quantity = 1) => {
    initDb();
    await delay(300);
    const cart = getItem("cartItems", []);
    const products = getItem("db_products", INITIAL_PRODUCTS);
    const p = products.find((prod) => prod.id === productId);

    if (!p) throw new Error("Product not found");

    const existingIdx = cart.findIndex((item) => item.id === productId);
    if (existingIdx >= 0) {
      cart[existingIdx].quantity += quantity;
    } else {
      cart.push({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity,
        image: p.name === "Laptop" ? "💻" : p.name === "Mouse" ? "🖱️" : p.name === "Keyboard" ? "⌨️" : p.name === "Monitor" ? "🖥️" : p.name === "Headphones" ? "🎧" : p.name === "T-Shirt" ? "👕" : p.name === "Jeans" ? "👖" : p.name === "Jacket" ? "🧥" : p.name === "Sneakers" ? "👟" : "📦",
        category: p.category,
        stock: p.stock,
      });
    }
    setItem("cartItems", cart);
    return cart;
  },
  undo: async () => {
    initDb();
    await delay(250);
    const cart = getItem("cartItems", []);
    if (cart.length > 0) {
      cart.pop(); // Stack LIFO pop
      setItem("cartItems", cart);
    }
    return cart;
  },
  clear: async () => {
    initDb();
    setItem("cartItems", []);
  },
  getQueue: async () => {
    initDb();
    await delay(200);
    return getItem("db_queue", INITIAL_QUEUE);
  },
  enqueue: async (customerData) => {
    initDb();
    await delay(300);
    const queue = getItem("db_queue", INITIAL_QUEUE);
    const newCustomer = {
      id: Date.now(),
      name: customerData.name,
      isLoyaltyMember: customerData.isLoyaltyMember,
      cartTotal: customerData.cartTotal || 120.0,
      items: customerData.items || 2,
      waitTime: "5 min",
    };

    // Priority Queue: insert loyalty members first
    const updated = [...queue];
    if (newCustomer.isLoyaltyMember) {
      // Find the last index of loyalty member and insert after them
      const lastLoyalIdx = updated.findLastIndex((c) => c.isLoyaltyMember);
      if (lastLoyalIdx >= 0) {
        updated.splice(lastLoyalIdx + 1, 0, newCustomer);
      } else {
        updated.unshift(newCustomer);
      }
    } else {
      updated.push(newCustomer);
    }

    // Recompute wait times for priority simulation
    const finalQueue = updated.map((c, index) => ({
      ...c,
      waitTime: `${(index + 1) * 3} min`,
    }));

    setItem("db_queue", finalQueue);
    return finalQueue;
  },
  dequeue: async () => {
    initDb();
    await delay(400);
    const queue = getItem("db_queue", INITIAL_QUEUE);
    if (queue.length === 0) return null;
    const served = queue.shift();
    setItem("db_queue", queue);

    // Also deduct stock from Products database as checkout occurs!
    const products = getItem("db_products", INITIAL_PRODUCTS);
    const warehouses = getItem("db_warehouses", INITIAL_WAREHOUSES);
    
    // Simulate deduct stock (approx 1 Laptop or some elements)
    const updatedProducts = products.map((p) => {
      if (p.id === 1 && served.cartTotal > 500) {
        return { ...p, stock: Math.max(0, p.stock - 1) };
      }
      if (p.id === 6 && served.cartTotal < 100) {
        return { ...p, stock: Math.max(0, p.stock - 2) };
      }
      return p;
    });
    setItem("db_products", updatedProducts);

    // Add purchase receipt to Customer purchase history
    const customers = getItem("db_customers", INITIAL_CUSTOMERS);
    const client = customers.find((c) => c.name.toLowerCase() === served.name.toLowerCase());
    if (client) {
      const today = new Date().toISOString().split("T")[0];
      const receiptNo = Math.floor(1000 + Math.random() * 9000);
      const receiptString = `Receipt #${receiptNo} - served via priority queue | Subtotal: ₹${served.cartTotal.toFixed(2)} | Date: ${today} | Total Paid: ₹${served.cartTotal.toFixed(2)}`;
      client.purchaseHistory = [receiptString, ...(client.purchaseHistory || [])];
      setItem("db_customers", customers);
    }

    return served;
  },
};

// CRM CUSTOMERS
export const customersDb = {
  getAll: async () => {
    initDb();
    await delay(300);
    return getItem("db_customers", INITIAL_CUSTOMERS);
  },
  create: async (cData) => {
    initDb();
    await delay(400);
    const customers = getItem("db_customers", INITIAL_CUSTOMERS);
    const nextId = customers.length ? Math.max(...customers.map((c) => c.id)) + 1 : 1;
    const today = new Date().toISOString().split("T")[0];
    const newCustomer = {
      id: nextId,
      name: cData.name,
      isLoyaltyMember: cData.isLoyaltyMember,
      registrationDate: today,
      purchaseHistory: [],
    };
    const updated = [...customers, newCustomer];
    setItem("db_customers", updated);
    return newCustomer;
  },
};

// DYNAMIC DIAGNOSTICS & BUDGET FORECASTING
export const diagnosticDb = {
  getAlerts: async () => {
    initDb();
    const products = getItem("db_products", INITIAL_PRODUCTS);
    const alerts = [];

    products.forEach((p) => {
      // 1. Expiry alerts (expires soon - in 2026)
      if (p.expiryDate && p.expiryDate.startsWith("2026")) {
        alerts.push({
          id: p.id + 100,
          type: "EXPIRY",
          productName: p.name,
          message: `Perishable threat: product expires soon on ${p.expiryDate}`,
          severity: "CRITICAL",
        });
      }
      // 2. Overstock alerts (stock > 80% capacity)
      const ratio = p.stock / p.maxStock;
      if (ratio > 0.85) {
        alerts.push({
          id: p.id + 200,
          type: "OVERSTOCK",
          productName: p.name,
          message: `Storage overcapacity: Stock level is at ${p.stock} units (max: ${p.maxStock})`,
          severity: "WARNING",
        });
      }
      // 3. Demand surge alerts (rating > 4.5 and popularity > 80)
      if (p.rating > 4.5 && p.popularity > 80) {
        alerts.push({
          id: p.id + 300,
          type: "SPIKE",
          productName: p.name,
          message: `Demand surge: High sales spike expected due to high rating and popularity (${p.popularity}%)`,
          severity: "INFO",
        });
      }
    });

    return alerts.slice(0, 3); // cap at 3 key alerts
  },
  getRestockPlan: async (budget = 8000) => {
    initDb();
    const products = getItem("db_products", INITIAL_PRODUCTS);

    // Greedy Restocking algorithm
    // Restock criteria: deficit (maxStock - stock) > 0
    // Priority: popularity * turnoverRate (higher is better)
    // Order up to deficit or budget ceiling
    const restockCandidates = products
      .map((p) => {
        const deficit = Math.max(0, p.maxStock - p.stock);
        const costPerUnit = Math.round(p.basePrice * 0.4); // supply wholesale is 40% of base price
        const priority = p.popularity * p.turnoverRate;
        return {
          productId: p.id,
          productName: p.name,
          priority,
          deficit,
          costPerUnit,
        };
      })
      .filter((c) => c.deficit > 0)
      .sort((a, b) => b.priority - a.priority); // Sort high priority first

    let remainingBudget = budget;
    const plan = [];

    const suppliers = [
      "Silicon Valley Logistics",
      "SoleCraft Leather Co",
      "Speedy Apparel Corp",
      "Apex Hub Suppliers",
    ];

    for (const cand of restockCandidates) {
      if (remainingBudget <= 0) break;
      const idealQty = cand.deficit;
      const maxAffordable = Math.floor(remainingBudget / cand.costPerUnit);
      const unitsToOrder = Math.min(idealQty, maxAffordable);

      if (unitsToOrder > 0) {
        const cost = unitsToOrder * cand.costPerUnit;
        remainingBudget -= cost;
        plan.push({
          productId: cand.productId,
          productName: cand.productName,
          recommendedSupplier: suppliers[cand.productId % suppliers.length],
          unitsToOrder,
          totalCost: cost,
          deliveryDays: (cand.productId % 5) + 1,
          priority: cand.priority,
        });
      }
    }
    return plan;
  },
  getForecasts: async () => {
    initDb();
    const products = getItem("db_products", INITIAL_PRODUCTS);
    return products.slice(0, 4).map((p) => {
      const baseSales = 10 + Math.round(p.popularity / 3);
      return {
        productId: p.id,
        productName: p.name,
        dailyForecast: Math.max(2, Math.round((baseSales * p.turnoverRate) / 7.0)),
        weeklyForecast: Math.max(10, Math.round(baseSales * p.turnoverRate)),
        monthlyForecast: Math.max(40, Math.round(baseSales * p.turnoverRate * 4.3)),
        accuracy: 85.0 + (p.id % 12),
      };
    });
  },
};
