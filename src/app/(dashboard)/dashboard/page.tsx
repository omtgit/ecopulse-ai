import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to EcoPulse, {session.user?.name}! 🌱</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
          <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-1">Monthly Footprint</h3>
          <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">412 kg</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">↓ 12% from last month</p>
        </div>
        <div className="p-6 rounded-xl bg-card border">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Streak</h3>
          <p className="text-3xl font-bold">5 days</p>
          <p className="text-sm text-muted-foreground mt-2">Keep logging habits!</p>
        </div>
        <div className="p-6 rounded-xl bg-card border">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Points</h3>
          <p className="text-3xl font-bold">450</p>
          <p className="text-sm text-muted-foreground mt-2">Level 3 Eco Warrior</p>
        </div>
        <div className="p-6 rounded-xl bg-card border">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Challenges</h3>
          <p className="text-3xl font-bold">2</p>
          <p className="text-sm text-muted-foreground mt-2">Meatless Monday in progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-xl bg-card border">
          <h2 className="text-xl font-bold mb-4">AI Sustainability Coach 🤖</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium mb-1">💡 Suggestion: Active Commute</p>
              <p className="text-sm text-muted-foreground">If you replace 2 car rides/week with cycling, you reduce 18kg CO2/month.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium mb-1">💡 Suggestion: Energy Efficiency</p>
              <p className="text-sm text-muted-foreground">Switching to LED bulbs throughout your home can reduce electricity emissions by 15%.</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-xl bg-card border flex flex-col gap-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <Button asChild className="w-full justify-start">
            <Link href="/calculator">🧮 Calculate Footprint</Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/habits">✅ Log Daily Habits</Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/challenges">🏆 Join a Challenge</Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/reports">📄 Download Report</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
