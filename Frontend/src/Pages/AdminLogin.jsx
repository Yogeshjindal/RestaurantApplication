import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login(email, password, 'admin');
      if (result.success) {
        toast.success(result.message);
        navigate("/admin/dashboard");
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
            <h1>ADMIN LOGIN</h1>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>
              Restaurant Management System
            </p>
            <form onSubmit={handleSubmit}>
              <div>
                <input
                  type="email"
                  placeholder="Admin Email"
                  className="email_tag"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
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
                {loading ? "LOGGING IN..." : "ADMIN LOGIN"}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p onClick={() => navigate("/login")} style={{ cursor: "pointer", color: "#ff6b35" }}>
                Back to Customer Login
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;

