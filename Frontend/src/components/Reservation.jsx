import { HiOutlineArrowNarrowRight } from "react-icons/hi";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Reservation = () => {
  // User name/email/phone come from auth; not collected here
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReservation = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      toast.error("Please login to make a reservation");
      navigate("/login");
      return;
    }

    // Validate required fields (date, time, party size)
    if (!date || !time || !partySize) {
      toast.error("Please select date, time and party size");
      return;
    }

    try {
      const reservationData = {
        date,
        time,
        partySize: parseInt(partySize),
        specialRequests: specialRequests.trim()
      };

      console.log("Sending reservation data:", reservationData);

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/reservation`,
        reservationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      
      toast.success(data.message);
      setTime("");
      setDate("");
      setPartySize(1);
      setSpecialRequests("");
      navigate("/success");
    } catch (error) {
      console.error("Reservation error:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || "Something went wrong";
      if (status === 401) {
        toast.error("Please login to make a reservation");
        navigate("/login");
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <section className="reservation" id="reservation">
      <div className="container">
        <div className="banner">
          <img src="/reservation.png" alt="res" />
        </div>
        <div className="banner">
          <div className="reservation_form_box">
            <h1>MAKE A RESERVATION</h1>
            <p>For Further Questions, Please Call</p>
            <form>
              <div>
                <input
                  type="date"
                  placeholder="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <input
                  type="time"
                  placeholder="Time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Party Size"
                  min="1"
                  max="20"
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Special Requests (Optional)"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>
              <button type="submit" onClick={handleReservation}>
                RESERVE NOW{" "}
                <span>
                  <HiOutlineArrowNarrowRight />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservation;
