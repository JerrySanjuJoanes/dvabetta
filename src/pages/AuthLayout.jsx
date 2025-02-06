import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuUser, LuMail, LuLock, LuCalendar } from "react-icons/lu";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-900 text-white relative overflow-hidden">
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-300  via-neutral-600 to-black opacity-40"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "signup"}
          className="relative z-10 bg-neutral-700 p-10 rounded-2xl shadow-2xl w-96 backdrop-blur-lg border border-neutral-600"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <h2 className="text-3xl font-bold text-center mb-6">
            {isLogin ? "Login" : "Sign Up"}
          </h2>
          <form className="flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-4"
            >
              <div className="flex items-center border-b-2 border-zinc-500 pb-2 focus-within:border-green-400 transition-all duration-300 group">
                <LuUser className="mr-2 text-gray-400 group-focus-within:text-green-400 transition-all duration-300" />
                <input
                  type="text"
                  className="w-full bg-transparent text-white outline-none placeholder-gray-500 focus:scale-105 transition-all duration-300"
                  placeholder="Name"
                />
              </div>
            </motion.div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-4"
              >
                <div className="flex items-center border-b-2 border-zinc-500 pb-2 focus-within:border-green-400 transition-all duration-300 group">
                  <LuMail className="mr-2 text-gray-400 group-focus-within:text-green-400 transition-all duration-300" />
                  <input
                    type="text"
                    className="w-full bg-transparent text-white outline-none placeholder-gray-500 focus:scale-105 transition-all duration-300"
                    placeholder="Username"
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: isLogin ? 0.1 : 0.2 }}
              className="mb-4"
            >
              <div className="flex items-center border-b-2 border-zinc-500 pb-2 focus-within:border-green-400 transition-all duration-300 group">
                <LuLock className="mr-2 text-gray-400 group-focus-within:text-green-400 transition-all duration-300" />
                <input
                  type="password"
                  className="w-full bg-transparent text-white outline-none placeholder-gray-500 focus:scale-105 transition-all duration-300"
                  placeholder="Password"
                />
              </div>
            </motion.div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mb-6"
              >
                <div className="flex items-center border-b-2 border-zinc-500 pb-2 focus-within:border-green-400 transition-all duration-300 group">
                  <LuCalendar className="mr-2 text-gray-400 group-focus-within:text-green-400 transition-all duration-300" />
                  <input
                    type="text"
                    className="w-full bg-transparent text-white outline-none placeholder-gray-500 focus:scale-105 transition-all duration-300"
                    placeholder="Age"
                  />
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-green-500 text-black font-bold py-2 rounded mt-4 duration-300 shadow-lg hover:shadow-2xl"
            >
              {isLogin ? "Login" : "Sign Up"}
            </motion.button>
          </form>

          <p className="text-center mt-4 cursor-pointer" onClick={toggleForm}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="font-bold underline text-green-400">
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
