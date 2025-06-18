const customerForm = document.getElementById('customerForm');
const customerList = document.getElementById('customerList');
const orderForm = document.getElementById('orderForm');
let editingCustomerId = null;
let currentCustomerId = null;

function showAddCustomer() {
  hideAll();
  document.getElementById('addCustomerSection').style.display = 'block';
}
function showCustomerList() {
  hideAll();
  document.getElementById('customerSection').style.display = 'block';
  fetchCustomers();
}
function returnHome() {
  hideAll();
  document.getElementById('welcomeScreen').style.display = 'block';
}
function showOrderForm(customerId) {
  hideAll();
  document.getElementById('orderFormSection').style.display = 'block';
  currentCustomerId = customerId;
}
function hideAll() {
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('addCustomerSection').style.display = 'none';
  document.getElementById('customerSection').style.display = 'none';
  document.getElementById('orderFormSection').style.display = 'none';
}

async function fetchCustomers() {
  const res = await fetch('http://localhost:3000/customers');
  const customers = await res.json();
  customerList.innerHTML = '';

  for (const customer of customers) {
    const card = document.createElement('div');
    card.className = 'customer-card';
    card.innerHTML = `
      <p><strong>Name:</strong> ${customer.firstName} ${customer.middleName || ''} ${customer.surname}</p>
      <p><strong>DOB:</strong> ${customer.dob}</p>
      <p><strong>Address:</strong> ${customer.homeAddress}</p>
      <p><strong>Registered:</strong> ${customer.registrationDate}</p>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
      <button class="order-btn">Add Order</button>
      <button class="toggle-history-btn">View Order History</button>
      <div class="order-history" style="display:none;"></div>
    `;

    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    const orderBtn = card.querySelector('.order-btn');
    const toggleHistoryBtn = card.querySelector('.toggle-history-btn');
    const orderHistoryDiv = card.querySelector('.order-history');

    editBtn.addEventListener('click', () => editCustomer(customer.id));
    deleteBtn.addEventListener('click', () => deleteCustomer(customer.id));
    orderBtn.addEventListener('click', () => showOrderForm(customer.id));
    toggleHistoryBtn.addEventListener('click', async () => {
      if (orderHistoryDiv.style.display === 'none') {
        const orderRes = await fetch(`http://localhost:3000/orders?customerId=${customer.id}`);
        const orders = await orderRes.json();

        if (orders.length === 0) {
          orderHistoryDiv.innerHTML = '<p>No orders found.</p>';
        } else {
          orderHistoryDiv.innerHTML = '<strong>Order History:</strong>';
          orders.forEach(order => {
            orderHistoryDiv.innerHTML += `
              <div class="order-entry">
                <p><em>${order.orderDate}</em> - ${order.menuItem} (${order.paymentMethod})</p>
                <p>${order.instructions}</p>
                <button onclick="deleteOrder(${order.id}, ${customer.id})">Delete Order</button>
              </div>
            `;
          });
        }

        orderHistoryDiv.style.display = 'block';
        toggleHistoryBtn.textContent = 'Hide Order History';
      } else {
        orderHistoryDiv.style.display = 'none';
        toggleHistoryBtn.textContent = 'View Order History';
      }
    });

    customerList.appendChild(card);
  }
}

customerForm.onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(customerForm);
  const data = Object.fromEntries(formData.entries());

  if (editingCustomerId) {
    await fetch(`http://localhost:3000/customers/${editingCustomerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    editingCustomerId = null;
  } else {
    await fetch('http://localhost:3000/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  customerForm.reset();
  showCustomerList();
};

async function editCustomer(id) {
  const res = await fetch(`http://localhost:3000/customers/${id}`);
  const customer = await res.json();

  showAddCustomer();
  customerForm.firstName.value = customer.firstName;
  customerForm.surname.value = customer.surname;
  customerForm.middleName.value = customer.middleName;
  customerForm.dob.value = customer.dob;
  customerForm.homeAddress.value = customer.homeAddress;
  customerForm.registrationDate.value = customer.registrationDate;
  editingCustomerId = id;
}

async function deleteCustomer(id) {
  if (confirm('Are you sure you want to delete this customer?')) {
    await fetch(`http://localhost:3000/customers/${id}`, { method: 'DELETE' });
    fetchCustomers();
  }
}

orderForm.onsubmit = async (e) => {
  e.preventDefault();

  const order = {
    customerId: currentCustomerId,
    orderDate: orderForm.orderDate.value,
    menuItem: orderForm.menuItem.value,
    instructions: orderForm.instructions.value,
    paymentMethod: orderForm.paymentMethod.value,
    reservationDate: orderForm.reservationDate.value,
  };

  await fetch('http://localhost:3000/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });

  orderForm.reset();
  showCustomerList();
};

async function deleteOrder(orderId, customerId) {
  if (confirm('Delete this order?')) {
    await fetch(`http://localhost:3000/orders/${orderId}`, {
      method: 'DELETE',
    });
    fetchCustomers();
  }
}

returnHome();
