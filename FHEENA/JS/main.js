// getting users from localstarage
let users = JSON.parse(localStorage.getItem("users")) || [];
console.log(users);

// function to save user into localStorage
function saveUser(user) {
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
}

const Adminform = document.getElementById("admin-form");
const adminMsg = document.getElementById("admin-login-status");
isAdmin = false;
if (Adminform) {
  Adminform.addEventListener("submit", function (e) {
    e.preventDefault();

    let adminUsername = document.getElementById("admin-username").value.trim();
    let adminPassword = document.getElementById("admin-password").value.trim();

    if (!(adminUsername === "admin" && adminPassword === "12345")) {
      adminMsg.style.color = "red";
      adminMsg.innerText = "Invalid Credentials!!";
    } else {
      adminMsg.innerText = "";
      isAdmin = true;
      window.location.href = "admin.html";
    }
  });
}

const userRegForm = document.getElementById("user-reg-form");
const userRegMsg = document.getElementById("user-reg-status");
if (userRegForm) {
  userRegForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const userData = Object.fromEntries(new FormData(userRegForm));
    saveUser(userData);
    userRegMsg.style.color = "green";
    userRegMsg.innerText = "Registration succesful!!";
    console.log(users);

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2500);
  });
}

// user login form logic
const userLoginForm = document.getElementById("login-form");
const userLoginMsg = document.getElementById("user-login-status");
if (userLoginForm) {
  userLoginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const userCreds = Object.fromEntries(new FormData(userLoginForm));
    console.log(userCreds);
    const validUser = users.find(
      (user) =>
        user.name === userCreds.username &&
        user.password === userCreds.password,
    );
    if (validUser) {
      userLoginMsg.style.color = "green";
      userLoginMsg.innerText = "Login Successful !!";
      localStorage.setItem("loggedInUser", JSON.stringify(validUser));
      console.log(localStorage);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      userLoginMsg.style.color = "red";
      userLoginMsg.innerText = "Invalid Username or Password";

      userLoginForm.reset();
      setTimeout(() => {
        userLoginMsg.innerText = "";
        document.getElementById("username").focus();
      }, 1000);
    }
  });
}

const loginLink = document.getElementById("login-link");
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
console.log(currentUser);
console.log(loginLink);
if (loginLink) {
  console.log("LoginLInk");

  if (currentUser) {
    loginLink.innerText = "Logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    });
  }
}

let products = JSON.parse(localStorage.getItem("products")) || [];
function renderProducts() {
  let productGrid = document.querySelector("#product-grid");

  if (productGrid) {
    products.forEach((product) => {
      let article = document.createElement("article");

      article.innerHTML = `
      <img src="${product.path}" alt="${product.title}">
      <p>${product.title}</p>
      <button class="primary add-to-cart">Add to cart</button> 
      `;

      const button = article.querySelector(".add-to-cart");

      button.addEventListener("click", function () {
        addToCart(product);
        button.disabled = true;
      });

      article.classList.add("product_card");
      productGrid.appendChild(article);
    });
  }
}

renderProducts();

cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(product) {
  if (currentUser) {
    const productWithUser = {
      ...product,
      username: currentUser.name,
    };

    cart.push(productWithUser);

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("added");
  } else {
    alert("Login Required!!\nLogin first!!");
  }
}

function renderCart() {
  const tableBody = document.getElementById("cartItems");

  if (!tableBody || !currentUser) {
    return;
  }

  tableBody.innerHTML = "";

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const cartItems = cart.filter((item) => item.username === currentUser.name);

  cartItems.forEach((item) => {
    const order = orders.find(
      (o) => o.productId === item.productId && o.username === currentUser.name,
    );

    let actionHTML = "";

    if (order) {
      actionHTML = order.status;
    } else {
      actionHTML = `
        <button onclick="buyProduct(${item.productId})">Buy</button>
        <button onclick="rentProduct(${item.productId})">Rent</button>
        <button onclick="removeItem(${item.productId})">Remove</button>
      `;
    }

    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.productId}</td>
      <td><img src="${item.path}" width="60"></td>
      <td>${item.title}</td>
      <td>${item.price}</td>
      <td>${item.rent}/day</td>
      <td colspan="3">${actionHTML}</td>
    `;

    tableBody.appendChild(tr);
  });
}
renderCart();

function removeItem(productId) {
  cart = cart.filter((item) => item.productId !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function buyProduct(productId) {
  const product = cart.find(
    (item) =>
      item.productId === productId && item.username === currentUser.name,
  );

  if (!product) return;

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const newOrder = {
    orderId: Date.now(),
    username: currentUser.name,
    productId: product.productId,
    title: product.title,
    path: product.path,
    price: product.price,
    rent: product.rent,
    mode: "Buy",
    status: "Pending",
  };

  orders.push(newOrder);

  localStorage.setItem("orders", JSON.stringify(orders));

  alert("Order placed successfully");

  renderCart();
}

function rentProduct(productId) {
  const product = cart.find(
    (item) =>
      item.productId === productId && item.username === currentUser.name,
  );

  if (!product) return;

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const newOrder = {
    orderId: Date.now(),
    username: currentUser.name,
    productId: product.productId,
    title: product.title,
    path: product.path,
    price: product.price,
    rent: product.rent,
    mode: "Rent",
    status: "Pending",
  };

  orders.push(newOrder);

  localStorage.setItem("orders", JSON.stringify(orders));

  alert("Rent request sent");

  renderCart();
}

function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const tbody = document.querySelector(".orderTable");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (orders.length === 0) {
    document.querySelector(".orders").innerHTML = "<h3>No Orders placed!</h3>";
    return;
  }

  orders.forEach((order) => {
    let row = document.createElement("tr");

    row.innerHTML = `
      <td>${order.username}</td>
      <td>${order.productId}</td>
      <td><img src="${order.path}" width="50"></td>
      <td>${order.title}</td>
      <td>${order.mode}</td>
      <td>${order.status}</td>
      <td>
        <button onclick="acceptOrder(${order.orderId})">Accept</button>
        <button onclick="rejectOrder(${order.orderId})">Reject</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

loadOrders();

function renderAdminProducts() {
  const table = document.getElementById("productTable");

  if (!table) return;

  table.innerHTML = "";

  products.forEach((product) => {
    let row = document.createElement("tr");

    row.innerHTML = `
      <td>${product.productId}</td>
      <td><img src="${product.path}" width="50"></td>
      <td>${product.title}</td>
      <td>${product.price}</td>
      <td>${product.rent}</td>

      <td>
        <button onclick="deleteProduct(${product.productId})">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}

const productForm = document.getElementById("productForm");
productForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const newId =
    products.length > 0 ? products[products.length - 1].productId + 1 : 1;

  const newProduct = {
    productId: newId,
    title: document.getElementById("productTitle").value,
    price: document.getElementById("productPrice").value,
    rent: document.getElementById("productRent").value,
    path: document.getElementById("productImage").value,
  };

  products.push(newProduct);

  localStorage.setItem("products", JSON.stringify(products));

  renderAdminProducts();
});
function deleteProduct(id) {
  products = products.filter((product) => product.productId !== id);

  localStorage.setItem("products", JSON.stringify(products));

  renderAdminProducts();
}
renderAdminProducts();

function deleteOrder(id) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders = orders.filter((product) => product.productId !== id);
  localStorage.setItem("orders", JSON.stringify(orders));
}

function acceptOrder(orderId) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  orders = orders.map((order) => {
    if (order.orderId === orderId) {
      order.status = "Order Confirmed";
    }
    return order;
  });

  localStorage.setItem("orders", JSON.stringify(orders));

  loadOrders();
}

function rejectOrder(orderId) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  orders = orders.map((order) => {
    if (order.orderId === orderId) {
      order.status = "Rejected";
    }
    return order;
  });

  localStorage.setItem("orders", JSON.stringify(orders));
  loadOrders();
}
