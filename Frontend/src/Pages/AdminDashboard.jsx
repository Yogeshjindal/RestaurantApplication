import { useState, useEffect } from "react";
import { io as createIO } from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reservations");
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "main_course",
    isAvailable: true,
    preparationTime: 15,
    ingredients: [],
    allergens: []
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate("/");
      return;
    }
    fetchData();
    const socket = createIO(API_BASE, { withCredentials: true, transports: ["websocket"] });
    socket.on("connect", () => {});
    socket.on("reservation:updated", () => {
      fetchData();
    });
    return () => {
      socket.disconnect();
    };
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      console.log("Fetching data for admin dashboard...");
      console.log("User:", user);
      
      const [reservationsRes, menuRes] = await Promise.all([
        axios.get(`${API_BASE}/reservation/all`, { withCredentials: true }),
        axios.get(`${API_BASE}/menu`, { withCredentials: true })
      ]);
      
      console.log("Reservations response:", reservationsRes.data);
      console.log("Menu response:", menuRes.data);
      
      setReservations(reservationsRes.data.data);
      setMenuItems(menuRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error response:", error.response?.data);
      toast.error(`Failed to fetch data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/reservation/${id}/status`, 
        { status }, 
        { withCredentials: true }
      );
      toast.success("Reservation status updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update reservation");
    }
  };

  const createMenuItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/menu`, newMenuItem, { withCredentials: true });
      toast.success("Menu item created successfully");
      setNewMenuItem({
        name: "",
        description: "",
        price: "",
        category: "main_course",
        isAvailable: true,
        preparationTime: 15,
        ingredients: [],
        allergens: []
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to create menu item");
    }
  };

  const toggleMenuItemAvailability = async (id) => {
    try {
      await axios.patch(`${API_BASE}/menu/${id}/toggle`, {}, { withCredentials: true });
      toast.success("Menu item availability updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update menu item");
    }
  };

  const deleteMenuItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await axios.delete(`${API_BASE}/menu/${id}`, { withCredentials: true });
        toast.success("Menu item deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete menu item");
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const testConnection = async () => {
    try {
      console.log("Testing backend connection...");
      const response = await axios.get(`${API_BASE}/test`);
      console.log("Backend test response:", response.data);
      toast.success("Backend connection successful!");
    } catch (error) {
      console.error("Backend connection failed:", error);
      toast.error("Backend connection failed!");
    }
  };

  const testAuth = async () => {
    try {
      console.log("Testing auth...");
      const response = await axios.get(`${API_BASE}/test-auth`, { withCredentials: true });
      console.log("Auth test response:", response.data);
      toast.success("Auth test successful!");
    } catch (error) {
      console.error("Auth test failed:", error);
      toast.error("Auth test failed!");
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        background: '#ff6b35', 
        color: 'white', 
        padding: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h1>Admin Dashboard</h1>
        <div>
          <span style={{ marginRight: '20px' }}>Welcome, {user?.name}</span>
          <button onClick={testConnection} style={{ 
            background: 'green', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}>
            Test Backend
          </button>
          <button onClick={testAuth} style={{ 
            background: 'blue', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}>
            Test Auth
          </button>
          <button onClick={handleLogout} style={{ 
            background: 'white', 
            color: '#ff6b35', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '20px'
      }}>
        <button 
          onClick={() => setActiveTab("reservations")}
          style={{
            padding: '10px 20px',
            background: activeTab === "reservations" ? '#ff6b35' : 'transparent',
            color: activeTab === "reservations" ? 'white' : '#ff6b35',
            border: '1px solid #ff6b35',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reservations ({reservations.length})
        </button>
        <button 
          onClick={() => setActiveTab("menu")}
          style={{
            padding: '10px 20px',
            background: activeTab === "menu" ? '#ff6b35' : 'transparent',
            color: activeTab === "menu" ? 'white' : '#ff6b35',
            border: '1px solid #ff6b35',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Menu Management ({menuItems.length})
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === "reservations" && (
          <div>
            <h2>Reservations</h2>
            <div style={{ 
              display: 'grid', 
              gap: '20px', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' 
            }}>
              {reservations.map((reservation) => (
                <div key={reservation._id} style={{ 
                  background: 'white', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                }}>
                  <h3>{reservation.firstName} {reservation.lastName}</h3>
                  <p><strong>Email:</strong> {reservation.email}</p>
                  <p><strong>Date:</strong> {reservation.date}</p>
                  <p><strong>Time:</strong> {reservation.time}</p>
                  <p><strong>Party Size:</strong> {reservation.partySize}</p>
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      color: reservation.status === 'confirmed' ? 'green' : 
                            reservation.status === 'pending' ? 'orange' : 'red',
                      marginLeft: '5px'
                    }}>
                      {reservation.status.toUpperCase()}
                    </span>
                  </p>
                  {reservation.orderItems?.length > 0 && (
                    <div>
                      <strong>Order Items:</strong>
                      <ul>
                        {reservation.orderItems.map((item, index) => (
                          <li key={index}>
                            {item.menuItem?.name} x {item.quantity} - ${item.price}
                          </li>
                        ))}
                      </ul>
                      <p><strong>Total: ${reservation.totalAmount}</strong></p>
                    </div>
                  )}
                  {reservation.specialRequests && (
                    <p><strong>Special Requests:</strong> {reservation.specialRequests}</p>
                  )}
                  
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => updateReservationStatus(reservation._id, 'confirmed')}
                      style={{ 
                        background: 'green', 
                        color: 'white', 
                        border: 'none', 
                        padding: '5px 10px', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => updateReservationStatus(reservation._id, 'cancelled')}
                      style={{ 
                        background: 'red', 
                        color: 'white', 
                        border: 'none', 
                        padding: '5px 10px', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => updateReservationStatus(reservation._id, 'completed')}
                      style={{ 
                        background: 'blue', 
                        color: 'white', 
                        border: 'none', 
                        padding: '5px 10px', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div>
            <h2>Menu Management</h2>
            
            {/* Add New Menu Item Form */}
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>Add New Menu Item</h3>
              <form onSubmit={createMenuItem}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={newMenuItem.name}
                    onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                    required
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newMenuItem.price}
                    onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                    required
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={newMenuItem.description}
                  onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    marginBottom: '15px',
                    minHeight: '80px'
                  }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <select
                    value={newMenuItem.category}
                    onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="appetizer">Appetizer</option>
                    <option value="main_course">Main Course</option>
                    <option value="dessert">Dessert</option>
                    <option value="beverage">Beverage</option>
                    <option value="salad">Salad</option>
                    <option value="soup">Soup</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Prep Time (minutes)"
                    value={newMenuItem.preparationTime}
                    onChange={(e) => setNewMenuItem({...newMenuItem, preparationTime: e.target.value})}
                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input
                      type="checkbox"
                      checked={newMenuItem.isAvailable}
                      onChange={(e) => setNewMenuItem({...newMenuItem, isAvailable: e.target.checked})}
                    />
                    Available
                  </label>
                </div>
                <button type="submit" style={{ 
                  background: '#ff6b35', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Add Menu Item
                </button>
              </form>
            </div>

            {/* Menu Items List */}
            <div style={{ 
              display: 'grid', 
              gap: '20px', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' 
            }}>
              {menuItems.map((item) => (
                <div key={item._id} style={{ 
                  background: 'white', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                }}>
                  <h3>{item.name}</h3>
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Price:</strong> ${item.price}</p>
                  <p><strong>Prep Time:</strong> {item.preparationTime} minutes</p>
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      color: item.isAvailable ? 'green' : 'red',
                      marginLeft: '5px'
                    }}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </p>
                  <p><strong>Description:</strong> {item.description}</p>
                  
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => toggleMenuItemAvailability(item._id)}
                      style={{ 
                        background: item.isAvailable ? 'orange' : 'green', 
                        color: 'white', 
                        border: 'none', 
                        padding: '5px 10px', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {item.isAvailable ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      onClick={() => deleteMenuItem(item._id)}
                      style={{ 
                        background: 'red', 
                        color: 'white', 
                        border: 'none', 
                        padding: '5px 10px', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
