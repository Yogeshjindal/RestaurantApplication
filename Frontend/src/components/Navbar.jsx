import  { useState } from "react";
import { data } from "../restApi.json";
import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'staff') return '/staff/dashboard';
    return '/';
  };

  const getDashboardText = () => {
    if (user?.role === 'admin') return 'ADMIN PANEL';
    if (user?.role === 'staff') return 'STAFF PANEL';
    return 'DASHBOARD';
  };

  return (
    <>
      <nav>
        <div className="logo"></div>
        <div className={show ? "navLinks showmenu" : "navLinks"}>
          <div className="links">
            {data[0].navbarLinks.map((element) => (
              <ScrollLink
                to={element.link}
                spy={true}
                smooth={true}
                duration={500}
                key={element.id}
              >
                {element.title}
              </ScrollLink>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {user ? (
              <>
                {user.role === 'admin' || user.role === 'staff' ? (
                  <RouterLink 
                    className="menuBtn" 
                    to={getDashboardLink()}
                    style={{ 
                      background: '#ff6b35', 
                      color: 'white', 
                      padding: '8px 16px', 
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    {getDashboardText()}
                  </RouterLink>
                ) : null}
                <span style={{ color: 'white', fontSize: '14px' }}>
                  {user.name} ({user.role})
                </span>
                <button className="menuBtn" onClick={logout}>LOGOUT</button>
              </>
            ) : (
              <>
                <RouterLink className="menuBtn" to="/login">LOGIN</RouterLink>
                <RouterLink 
                  to="/admin/login"
                  style={{ 
                    color: '#ff6b35', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    padding: '8px 16px',
                    border: '1px solid #ff6b35',
                    borderRadius: '4px'
                  }}
                >
                  ADMIN
                </RouterLink>
                <RouterLink 
                  to="/staff/login"
                  style={{ 
                    color: '#ff6b35', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    padding: '8px 16px',
                    border: '1px solid #ff6b35',
                    borderRadius: '4px'
                  }}
                >
                  STAFF
                </RouterLink>
              </>
            )}
          </div>
        </div>
        <div className="hamburger" onClick={()=> setShow(!show)}>
                <GiHamburgerMenu/>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
