
import { motion } from "framer-motion";

const Index = () => {
  const items = [
    { type: "apple", color: "apple", label: "Manzana Roja" },
    { type: "snake", color: "snake-blue", label: "Serpiente Azul" },
    { type: "snake", color: "snake-green", label: "Serpiente Verde" },
    { type: "snake", color: "snake-purple", label: "Serpiente Púrpura" },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f0f0f0]">
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex flex-col items-center gap-5 max-w-[400px] w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Visualización de Objetos
        </h2>
        
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-4 w-full">
            {item.type === "apple" ? (
              <div className={`w-8 h-8 rounded-full bg-${item.color}`} />
            ) : (
              <div className={`w-[100px] h-5 rounded-[10px] bg-${item.color} flex items-center pl-2.5`}>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-white rounded-full mr-2.5"
                  />
                ))}
              </div>
            )}
            <div className="font-bold text-gray-900">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
