import { ShoppingCart, Users, Package, Star, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iaHNsKDE5OSA4OSUgNDglIC8gMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        
        <div className="container mx-auto px-6 py-24 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight text-center md:text-7xl">
              🐾 Pet Food Store
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Your one-stop online marketplace for premium pet nutrition. Quality food for dogs, cats, birds & more!
            </p>
            <div className="pt-4 flex gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/auth">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Pet Food Store?</h2>
            <p className="text-lg text-muted-foreground">Quality nutrition for your beloved pets</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Package className="h-10 w-10" />}
              title="Wide Product Variety"
              description="Access to multiple brands, pet types, and dietary options all in one place."
            />
            <FeatureCard
              icon={<Star className="h-10 w-10" />}
              title="Customer Reviews"
              description="Make informed decisions with ratings and reviews from other pet owners."
            />
            <FeatureCard
              icon={<ShoppingCart className="h-10 w-10" />}
              title="Easy Shopping"
              description="Simple cart system with secure checkout and multiple payment options."
            />
            <FeatureCard
              icon={<Truck className="h-10 w-10" />}
              title="Fast Delivery"
              description="Quick and reliable delivery right to your doorstep."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10" />}
              title="Quality Guaranteed"
              description="All products are verified for quality and freshness."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Seller Dashboard"
              description="Easy-to-use platform for sellers to manage products and orders."
            />
          </div>
        </div>
      </section>

      {/* Pet Types Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Food for All Your Pets</h2>
            <p className="text-lg text-muted-foreground">We cater to all types of pets</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["🐕 Dogs", "🐈 Cats", "🐦 Birds", "🐠 Fish", "🐹 Small Pets", "🐢 Reptiles"].map((pet) => (
              <div key={pet} className="px-6 py-4 bg-card rounded-xl border border-border text-lg font-medium hover:shadow-lg transition-shadow">
                {pet}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-secondary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Shop for Your Pet?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of happy pet owners. Register now as a Customer or Seller!
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/auth">Create Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 Online Pet Food Application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg hover:scale-105 transition-all duration-300">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;