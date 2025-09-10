import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let result;
      if (isRegister) {
        const userData = { name, email, password, role };
        if (role === 'admin' || role === 'staff') {
          userData.phone = phone;
        }
        result = await register(userData);
      } else {
        result = await login(email, password, role);
      }
      
      if (result.success) {
        toast.success(result.message);
        // Navigate based on role
        if (role === 'admin') {
          navigate("/admin/dashboard");
        } else if (role === 'staff') {
          navigate("/staff/dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reservation" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="banner">
          <div className="reservation_form_box" style={{ maxWidth: 480, margin: "0 auto" }}>
            <h1>{isRegister ? "REGISTER" : "LOGIN"}</h1>
            <p onClick={() => setIsRegister(!isRegister)} style={{ cursor: "pointer" }}>
              {isRegister ? "Have an account? Login" : "New here? Register"}
            </p>
            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div>
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px",
                    marginBottom: "10px"
                  }}
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="email_tag"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {isRegister && (role === 'admin' || role === 'staff') && (
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" disabled={loading}>
                {loading ? "PROCESSING..." : (isRegister ? "REGISTER" : "LOGIN")}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ marginBottom: '10px' }}>Quick Access:</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  onClick={() => navigate("/admin/login")}
                  style={{ 
                    padding: '8px 16px', 
                    background: '#ff6b35', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Admin Login
                </button>
                <button 
                  onClick={() => navigate("/staff/login")}
                  style={{ 
                    padding: '8px 16px', 
                    background: '#ff6b35', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Staff Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;


