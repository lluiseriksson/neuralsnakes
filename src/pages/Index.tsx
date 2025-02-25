
import { motion } from "framer-motion";

const Index = () => {
  const items = [
    { type: "apple", color: "apple", label: "Manzana Roja" },
    { type: "snake", color: "snake-blue", label: "Serpiente Azul" },
    { type: "snake", color: "snake-green", label: "Serpiente Verde" },
    { type: "snake", color: "snake-purple", label: "Serpiente Púrpura" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl font-semibold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Visualización de Objetos
          </motion.h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-4">
                {item.type === "apple" ? (
                  <div
                    className={`w-12 h-12 rounded-full bg-${item.color} animate-apple-bounce shadow-lg`}
                  />
                ) : (
                  <div
                    className={`w-32 h-8 rounded-full bg-${item.color} animate-snake-move relative flex items-center px-2`}
                  >
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full mx-1"
                      />
                    ))}
                  </div>
                )}
                <span className="text-lg font-medium text-gray-800">
                  {item.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
