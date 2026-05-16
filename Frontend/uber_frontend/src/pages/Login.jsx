import { useState, useContext } from "react";

import { Link, useNavigate } from "react-router-dom";

import API from "../api/axios";

import { AuthContext } from "../context/authContextValue";


function Login() {

  // ===================================================
  // 🔥 FORM STATES
  // ===================================================

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  // ===================================================
  // 🔥 AUTH CONTEXT
  // ===================================================

  const { login } = useContext(AuthContext);


  // ===================================================
  // 🔥 NAVIGATE
  // ===================================================

  const navigate = useNavigate();


  // ===================================================
  // 🔥 LOGIN FUNCTION
  // ===================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      // 🔥 loading start
      setLoading(true);

      // 🔥 backend API call
      const response = await API.post("/auth/login", {
        email,
        password
      });

      // 🔥 backend data
      const data = response.data;


      // 🔥 save user + token
      login(data.user, data.token);


      // ===================================================
      // 🔥 ROLE BASED REDIRECT
      // ===================================================

      if (data.user.role === "driver") {

        navigate("/driver/dashboard");

      }

      else {

        navigate("/user/dashboard");

      }

    }

    catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message || "Login failed"
      );
    }

    finally {

      // 🔥 loading stop
      setLoading(false);

    }
  };


  // ===================================================
  // 🔥 UI
  // ===================================================

  return (

    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      {/* ================= LOGIN CARD ================= */}

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

        {/* ================= LOGO ================= */}

        <h1 className="text-4xl font-bold text-center mb-2">
          Uber
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Login to continue your ride
        </p>


        {/* ================= FORM ================= */}

        <form onSubmit={handleLogin}>


          {/* ================= EMAIL ================= */}

          <div className="mb-5">

            <label className="block mb-2 font-semibold">
              Email
            </label>

            <input
              type="email"

              placeholder="Enter your email"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              required

              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-black
                transition
              "
            />

          </div>


          {/* ================= PASSWORD ================= */}

          <div className="mb-6">

            <label className="block mb-2 font-semibold">
              Password
            </label>

            <input
              type="password"

              placeholder="Enter your password"

              value={password}

              onChange={(e) => setPassword(e.target.value)}

              required

              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-black
                transition
              "
            />

          </div>


          {/* ================= BUTTON ================= */}

          <button
            type="submit"

            disabled={loading}

            className="
              w-full
              bg-black
              text-white
              py-3
              rounded-xl
              font-semibold
              hover:bg-gray-900
              transition
            "
          >

            {loading ? "Logging in..." : "Login"}

          </button>

        </form>


        {/* ================= REGISTER LINK ================= */}

        <p className="text-center mt-6 text-gray-600">

          Don’t have an account?{" "}

          <Link
            to="/register"
            className="font-bold text-black hover:underline"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}


export default Login;
