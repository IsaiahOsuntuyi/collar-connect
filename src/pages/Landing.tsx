import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  Heart,
  MessageSquare,
  Target,
  Users,
} from "lucide-react";
import { StudentBadge } from "@/components/StudentBadge";
import { IndustryBadge } from "@/components/IndustryBadge";
import { RecruiterBadge } from "@/components/RecruiterBadge";

const roleValues = [
  {
    icon: Compass,
    title: "AI Career Roadmaps & Verified Portfolios",
    description:
      "Get personalized 6-month career maps, showcase real GitHub and portfolio projects, and get discovered by the right people.",
    gradient: "from-primary/20 to-primary/5",
    roleTag: <StudentBadge compact />,
    cta: { label: "Start your roadmap", role: "student" },
  },
  {
    icon: Users,
    title: "Mentorship & Community Leadership",
    description:
      "Share career insights, answer questions in the Q&A forum, and guide the next generation of engineers.",
    gradient: "from-secondary/20 to-secondary/5",
    roleTag: <IndustryBadge mentor />,
    cta: { label: "Share your expertise", role: "industry" },
  },
  {
    icon: BadgeCheck,
    title: "Vetted Candidate Sourcing",
    description:
      "Direct messaging and access to pre-vetted, high-potential diverse tech talent without the resume clutter.",
    gradient: "from-accent/20 to-accent/5",
    roleTag: <RecruiterBadge compact />,
    cta: { label: "Source verified talent", role: "recruiter" },
  },
];

const liveFeatures = [
  {
    icon: Heart,
    title: "Vibrant Community Feed",
    description:
      "A multi-reaction system powers an engaging feed where students, recruiters, and working industry professionals connect, celebrate wins, and share insights.",
    preview: <CommunityFeedMock />,
  },
  {
    icon: Target,
    title: "AI Career Roadmaps",
    description:
      "Personalized 6-month roadmaps and CFAANG benchmarking turn career uncertainty into a concrete, role-specific action plan.",
    preview: <RoadmapMock />,
  },
  {
    icon: MessageSquare,
    title: "Dynamic Discussions",
    description:
      "In-line comment editing and threaded replies keep conversations clear, current, and productive.",
    preview: <DiscussionMock />,
  },
];

function CommunityFeedMock() {
  return (
    <div className="w-full rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground">
          AM
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground truncate">Alex M.</p>
          <StudentBadge compact school="Howard University" graduationYear={2026} />
        </div>
      </div>
      <p className="mt-2.5 text-[11px] text-muted-foreground line-clamp-2">
        Just landed my first SWE internship — grateful for this community!
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          👍 24
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary">
          💡 8
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
          🚀 5
        </span>
      </div>
    </div>
  );
}

function RoadmapMock() {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 rounded-xl border bg-card p-3 shadow-sm">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground truncate">Target: Systems Engineer</p>
          <p className="text-[10px] text-muted-foreground">Cloud & distributed systems focus</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-secondary/10 px-3 py-2">
        <span className="text-[10px] font-medium text-secondary">6-Month Plan</span>
        <span className="text-[10px] text-secondary/80">Milestone 3 of 6</span>
      </div>
    </div>
  );
}

function DiscussionMock() {
  return (
    <div className="w-full rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex gap-2">
        <div className="flex flex-col items-center gap-0.5">
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
            JD
          </div>
          <div className="w-px flex-1 bg-border" />
        </div>
        <div className="min-w-0 flex-1 pb-1">
          <div className="rounded-lg bg-muted/60 px-2.5 py-1.5">
            <p className="text-[11px] font-medium text-foreground">How do I break into cybersecurity?</p>
          </div>
          <div className="mt-1.5 flex gap-2">
            <div className="h-5 w-5 rounded-full bg-secondary/20 flex-shrink-0" />
            <div className="rounded-lg bg-secondary/10 px-2.5 py-1">
              <p className="text-[10px] text-secondary">
                Start with networking fundamentals + a home lab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            NextGen Collar
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="hidden sm:inline-flex"
            >
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")}>
              Join Now
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 sm:py-20 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                <div
                  className="inline-flex items-center rounded-full border bg-background/60 px-3 py-1 text-xs sm:text-sm font-medium text-primary shadow-sm opacity-0 animate-fade-in-up"
                  style={{ animationDelay: "0ms" }}
                >
                  <span className="mr-2 h-2 w-2 rounded-full bg-accent animate-pulse" />
                  Welcome to NextGen Collar
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] opacity-0 animate-fade-in-up">
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    Where Diverse Talent
                  </span>
                  <br />
                  <span className="text-foreground">Meets Industry Excellence</span>
                </h2>

                <p
                  className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed opacity-0 animate-fade-in-up"
                  style={{ animationDelay: "150ms" }}
                >
                  Helping students map their tech careers, empowering industry
                  mentors to share insights, and enabling recruiters to discover
                  vetted, diverse talent.
                </p>

                <div
                  className="space-y-4 pt-2 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: "300ms" }}
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
                    <Button
                      size="lg"
                      onClick={() => navigate("/auth?role=student&mode=signup")}
                      className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 shadow-lg hover:shadow-[0_0_28px_-6px_hsl(var(--primary)/0.45)] hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 ease-premium"
                    >
                      Map Your Career
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/auth?role=recruiter&mode=signup")}
                      className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 border-2 hover:bg-accent hover:text-accent-foreground hover:border-accent hover:shadow-[0_0_28px_-6px_hsl(var(--accent)/0.4)] hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 ease-premium"
                    >
                      Find Top Talent
                    </Button>
                  </div>

                  <div className="flex justify-center lg:justify-start">
                    <button
                      onClick={() => navigate("/auth?role=industry&mode=signup")}
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      Are you an industry professional?
                      <span className="text-primary underline-offset-2 group-hover:underline">
                        Join as a Mentor
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>

                {/* Metric Strip */}
                <div
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-3 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: "450ms" }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 shadow-sm">
                    <span className="text-lg font-bold text-primary">10k+</span>
                    <span className="text-xs text-muted-foreground">Students</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 shadow-sm">
                    <span className="text-lg font-bold text-secondary">250+</span>
                    <span className="text-xs text-muted-foreground">Industry Mentors</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 shadow-sm">
                    <span className="text-lg font-bold text-accent">500+</span>
                    <span className="text-xs text-muted-foreground">Recruiters</span>
                  </div>
                </div>
              </div>

              {/* Hero Visual */}
              <div
                className="relative mx-auto w-full max-w-md lg:max-w-none opacity-0 animate-fade-in-up"
                style={{ animationDelay: "450ms" }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-2xl transform rotate-3" />
                <Card className="relative p-6 sm:p-8 rounded-3xl border bg-background/90 shadow-card backdrop-blur-sm hover:shadow-[0_0_40px_-12px_hsl(var(--primary)/0.25)] hover:-translate-y-1 transition-all duration-500 ease-premium">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
                        NG
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">NextGen Collar</p>
                        <p className="text-sm text-muted-foreground">
                          Bridging talent & opportunity
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 p-5">
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        "The fastest way to connect diverse student talent with
                        top tech recruiters and mentors who actually care."
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted font-bold text-[10px]">
                        M
                      </span>
                      <span>Trusted by students at 120+ universities</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Three Pillars / Role Breakdown */}
        <section className="py-16 sm:py-20 lg:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 opacity-0 animate-fade-in-up">
                Built for Students, Mentors & Recruiters.
              </h3>
              <p
                className="text-base sm:text-lg text-muted-foreground opacity-0 animate-fade-in-up"
                style={{ animationDelay: "150ms" }}
              >
                A complete ecosystem designed to launch careers, share industry
                wisdom, and hire top diverse talent.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {roleValues.map((value, idx) => (
                <Card
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-6 sm:p-8 shadow-card opacity-0 animate-fade-in-up hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_hsl(var(--primary)/0.18)] hover:ring-1 hover:ring-primary/20 transition-all duration-500 ease-premium h-full flex flex-col"
                  style={{ animationDelay: `${300 + idx * 120}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-4">{value.roleTag}</div>
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.35)]">
                      <value.icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-semibold text-card-foreground mb-2">
                      {value.title}
                    </h4>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-1">
                      {value.description}
                    </p>
                    <button
                      onClick={() =>
                        navigate(`/auth?role=${value.cta.role}&mode=signup`)
                      }
                      className="mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold text-primary hover:underline underline-offset-4 transition-all group-hover:gap-1.5"
                    >
                      {value.cta.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Live Features Showcase */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 opacity-0 animate-fade-in-up">
                Live Features
              </h3>
              <p
                className="text-base sm:text-lg text-muted-foreground opacity-0 animate-fade-in-up"
                style={{ animationDelay: "150ms" }}
              >
                The platform is already alive with tools that make networking,
                learning, and hiring feel effortless.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {liveFeatures.map((feature, idx) => (
                <Card
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-card to-muted p-6 sm:p-8 shadow-card opacity-0 animate-fade-in-up hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_hsl(var(--accent)/0.18)] hover:ring-1 hover:ring-accent/20 transition-all duration-500 ease-premium h-full flex flex-col"
                  style={{ animationDelay: `${300 + idx * 120}ms` }}
                >
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-accent/10 group-hover:scale-110" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-5">{feature.preview}</div>
                    <h4 className="text-xl font-semibold text-card-foreground mb-3">
                      {feature.title}
                    </h4>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-1">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4 opacity-0 animate-fade-in-up">
              Ready to Build the Future of Tech?
            </h3>
            <p
              className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto mb-8 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "150ms" }}
            >
              Whether you are mapping your career, sharing your expertise, or
              searching for your next great hire, NextGen Collar is where it
              happens.
            </p>
            <div
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "300ms" }}
            >
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth?role=student&mode=signup")}
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_28px_-6px_hsl(var(--secondary-foreground)/0.35)] transition-all duration-300 ease-premium"
              >
                Map Your Career
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth?role=industry&mode=signup")}
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-primary-foreground/50 hover:shadow-[0_0_28px_-6px_hsl(var(--primary-foreground)/0.25)] transition-all duration-300 ease-premium"
              >
                Join as a Mentor / Professional
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth?role=recruiter&mode=signup")}
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-primary-foreground/50 hover:shadow-[0_0_28px_-6px_hsl(var(--primary-foreground)/0.25)] transition-all duration-300 ease-premium"
              >
                Find Top Talent
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NextGen Collar. Championing
            diversity and inclusion in technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
