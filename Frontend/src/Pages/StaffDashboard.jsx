import { useState, useEffect } from "react";
import { io as createIO } from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const StaffDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reservations");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'staff') {
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
      console.log("Fetching data for staff dashboard...");
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

  const updateReservationStatus = async (id, status, tableNumber = '', notes = '') => {
    try {
      await axios.put(`${API_BASE}/reservation/${id}/status`, 
        { status, tableNumber, notes }, 
        { withCredentials: true }
      );
      toast.success("Reservation status updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update reservation");
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

  const handleLogout = async () => {
    await logout();
    navigate("/");
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
        <h1>Staff Dashboard</h1>
        <div>
          <span style={{ marginRight: '20px' }}>Welcome, {user?.name}</span>
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
          Menu Items ({menuItems.length})
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === "reservations" && (
          <div>
            <h2>Reservations Management</h2>
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
                  {reservation.tableNumber && (
                    <p><strong>Table:</strong> {reservation.tableNumber}</p>
                  )}
                  {reservation.orderItems?.length > 0 && (
                    <div>
                      <strong>Order Items:</strong>
                      <ul>
                        {reservation.orderItems.map((item, index) => (
                          <li key={index}>
                            {item.menuItem?.name} x {item.quantity} - ${item.price}
                            {item.specialInstructions && (
                              <span style={{ color: '#666', fontSize: '0.9em' }}>
                                ({item.specialInstructions})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      <p><strong>Total: ${reservation.totalAmount}</strong></p>
                    </div>
                  )}
                  {reservation.specialRequests && (
                    <p><strong>Special Requests:</strong> {reservation.specialRequests}</p>
                  )}
                  {reservation.notes && (
                    <p><strong>Staff Notes:</strong> {reservation.notes}</p>
                  )}
                  
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => {
                        const tableNumber = prompt("Enter table number (optional):");
                        updateReservationStatus(reservation._id, 'confirmed', tableNumber);
                      }}
                      style={{ 
                        background: 'green', 
                        color: 'white', 
                        border: 'none', 
                        padding: '5px 10px', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Confirm & Assign Table
                    </button>
                    <button 
                      onClick={() => {
                        const notes = prompt("Add notes (optional):");
                        updateReservationStatus(reservation._id, 'completed', '', notes);
                      }}
                      style={{ 
                        background: 'blue', 
                        color: 'white', 
                        border: 'none', 
                        padding: '5px 10px', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Mark Complete
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div>
            <h2>Menu Items</h2>
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
                  
                  {item.ingredients?.length > 0 && (
                    <div>
                      <strong>Ingredients:</strong>
                      <ul>
                        {item.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {item.allergens?.length > 0 && (
                    <div>
                      <strong>Allergens:</strong>
                      <span style={{ color: 'red' }}>
                        {item.allergens.join(', ')}
                      </span>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '15px' }}>
                    <button 
                      onClick={() => toggleMenuItemAvailability(item._id)}
                      style={{ 
                        background: item.isAvailable ? 'orange' : 'green', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      {item.isAvailable ? 'Mark as Unavailable' : 'Mark as Available'}
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

export default StaffDashboard;
