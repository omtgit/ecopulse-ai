import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-emerald-600 dark:text-emerald-400 mb-6">
        EcoPulse AI 🌍
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mb-10">
        Your personal AI sustainability coach. Track your carbon footprint, build green habits, and participate in eco-challenges to make a real impact on our planet.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/register">Get Started Free</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login">Login</Link>
        </Button>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="p-6 rounded-2xl bg-card border shadow-sm">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Track Footprint</h3>
          <p className="text-muted-foreground">Calculate your emissions from transport, food, electricity, and shopping.</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border shadow-sm">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">AI Insights</h3>
          <p className="text-muted-foreground">Get personalized recommendations from our AI coach on how to reduce your impact.</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border shadow-sm">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2">Gamified Challenges</h3>
          <p className="text-muted-foreground">Earn points and badges by participating in weekly sustainability challenges.</p>
        </div>
      </div>
    </div>
  );
}
