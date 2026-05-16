import { useState, useContext } from "react";

import { Link, useNavigate } from "react-router-dom";

import API from "../api/axios";

import { AuthContext } from "../context/authContextValue";


function Register() {

  // ===================================================
  // 🔥 STATES
  // ===================================================

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [role, setRole] = useState("user");

  const [loading, setLoading] = useState(false);


  // ===================================================
  // 🔥 CONTEXT
  // ===================================================

  const { login } = useContext(AuthContext);


  // ===================================================
  // 🔥 NAVIGATION
  // ===================================================

  const navigate = useNavigate();


  // ===================================================
  // 🔥 REGISTER FUNCTION
  // ===================================================

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      // 🔥 backend API call
      const response = await API.post("/auth/register", {
        name,
        email,
        password,
        role
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
        error.response?.data?.message || "Register failed"
      );
    }

    finally {

      setLoading(false);

    }
  };


  // ===================================================
  // 🔥 UI
  // ===================================================

  return (

    <div className="min-h-screen bg-zinc-900 flex justify-center items-center px-4 py-8">

      {/* ================= REGISTER CARD ================= */}

      <div
        className="
          w-full
          max-w-sm
          bg-white
          rounded-3xl
          shadow-2xl
          p-5
          sm:p-6
        "
      >

        {/* ================= TITLE ================= */}

        <h1 className="text-3xl font-bold text-center mb-2">
          Uber
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Create your new account
        </p>


        {/* ================= FORM ================= */}

        <form onSubmit={handleRegister}>


          {/* ================= NAME ================= */}

          <div className="mb-4">

            <label className="block mb-2 font-semibold">
              Full Name
            </label>

            <input
              type="text"

              placeholder="Enter your full name"

              value={name}

              onChange={(e) => setName(e.target.value)}

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
                focus:ring-2
                focus:ring-gray-200
                transition
              "
            />

          </div>


          {/* ================= EMAIL ================= */}

          <div className="mb-4">

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
                focus:ring-2
                focus:ring-gray-200
                transition
              "
            />

          </div>


          {/* ================= PASSWORD ================= */}

          <div className="mb-4">

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
                focus:ring-2
                focus:ring-gray-200
                transition
              "
            />

          </div>


          {/* ================= ROLE ================= */}

          <div className="mb-6">

            <label className="block mb-2 font-semibold">
              Select Role
            </label>

            <select
              value={role}

              onChange={(e) => setRole(e.target.value)}

              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-black
                focus:ring-2
                focus:ring-gray-200
              "
            >

              <option value="user">
                User
              </option>

              <option value="driver">
                Driver
              </option>

            </select>

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

            {loading ? "Creating Account..." : "Register"}

          </button>

        </form>


        {/* ================= LOGIN LINK ================= */}

        <p className="text-center mt-6 text-gray-600">

          Already have an account?{" "}

          <Link
            to="/login"
            className="font-bold text-black hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}


export default Register;
