import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, CookingPot, Truck, Smile } from 'lucide-react';

const steps = [
  { title: 'Order Placed', icon: <CheckCircle size={28} />, status: 'active' },
  { title: 'Preparing Food', icon: <CookingPot size={20} />, status: 'inactive' },
  { title: 'Out for Delivery', icon: <Truck size={20} />, status: 'inactive' },
  { title: 'Delivered', icon: <Smile size={20} />, status: 'inactive' },
];

const OrderConfirmation = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-400 to-red-500 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-2xl w-full relative"
      >
        {/* Title */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-gray-800 mb-6"
        >
          Order Confirmed!
        </motion.h2>

        {/* Stepper */}
        <div className="flex items-center justify-between relative px-2">
          {steps.map((step, index) => (
            <div className="flex flex-col items-center relative w-full" key={index}>
              {/* Line before step (except first) */}
              {index !== 0 && (
                <div className="absolute top-5 -left-1/2 w-full h-1 bg-gray-300 z-0">
                  <div className="h-1 w-full bg-dotted-pattern"></div>
                </div>
              )}

              {/* Icon circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2, type: 'spring' }}
                className={`z-10 rounded-full border-4 ${
                  step.status === 'active'
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                } p-3 flex items-center justify-center shadow-md`}
              >
                {step.icon}
              </motion.div>

              {/* Step label */}
              <span
                className={`mt-2 text-xs font-semibold ${
                  step.status === 'active' ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Message */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.2 }}
          className="text-gray-600 mt-8"
        >
          Your food is being prepared! We’ll update you on every step. 🍕🍔🚚
        </motion.p>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 bg-red-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-green-600 transition-all"
        >
          See More
        </motion.button>
      </motion.div>
    </div>
  );
};

export default OrderConfirmation;