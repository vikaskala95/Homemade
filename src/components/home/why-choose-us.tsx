import { Shield, Truck, Award, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: HeartHandshake,
    title: "Made with Love",
    description: "Every product is crafted by passionate home entrepreneurs with authentic recipes and skills.",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "Strict vendor verification and quality checks ensure you get the best homemade products.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Fresh products delivered to your doorstep with care and proper packaging.",
  },
  {
    icon: Award,
    title: "Support Local",
    description: "Every purchase directly supports local artisans and home-based businesses.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Why Homemade Everything?</h2>
          <p className="mt-2 text-gray-600">
            We connect you directly with local artisans and home entrepreneurs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
                  <Icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
