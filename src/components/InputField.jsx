// src/components/UI/InputField.jsx
import React from "react";
import { motion } from "framer-motion";

const InputField = ({ label, icon: Icon, type, value, onChange }) => {
  return (
    <motion.div
      className="flex flex-col gap-1 w-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <label className="text-green-400 font-semibold">{label}</label>
      <div className="flex items-center gap-2 bg-black text-white border border-green-400 p-2 rounded-lg">
        <Icon size={18} className="text-green-400" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="bg-transparent flex-1 outline-none text-white"
          required
        />
      </div>
    </motion.div>
  );
};

export default InputField;
