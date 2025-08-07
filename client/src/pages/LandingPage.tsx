import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBF5]">
      <header className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img
            src="/Study (2).png"
            className="w-16 h-16"
          />
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            {" "}
            {/* Link to login page */}
            <Button variant="outline" className="border-gray-300 text-gray-800 hover:bg-gray-100 bg-transparent">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            {" "}
            <Button className="bg-northeasternRed text-white hover:bg-northeasternRed/darker">Sign up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center py-12 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Social Media Icons - positioned absolutely to mimic the scattered look */}
        {/* <img
          src="/placeholder.svg?height=64&width=64&text=Instagram"
          alt="Instagram icon"
          width={64}
          height={64}
          className="absolute top-[20%] left-[15%] w-12 h-12 md:w-16 md:h-16"
        />
        <img
          src="/placeholder.svg?height=64&width=64&text=Discord"
          alt="Discord icon"
          width={64}
          height={64}
          className="absolute top-[15%] right-[20%] w-12 h-12 md:w-16 md:h-16"
        />
        <img
          src="/placeholder.svg?height=64&width=64&text=Snapchat"
          alt="Snapchat icon"
          width={64}
          height={64}
          className="absolute top-[40%] left-[10%] w-12 h-12 md:w-16 md:h-16"
        />
        <img
          src="/placeholder.svg?height=64&width=64&text=Facebook"
          alt="Facebook icon"
          width={64}
          height={64}
          className="absolute bottom-[20%] right-[15%] w-12 h-12 md:w-16 md:h-16"
        />
        <img
          src="/placeholder.svg?height=64&width=64&text=TikTok"
          alt="TikTok icon"
          width={64}
          height={64}
          className="absolute bottom-[15%] left-[20%] w-12 h-12 md:w-16 md:h-16"
        />
        <img
          src="/placeholder.svg?height=64&width=64&text=X"
          alt="X icon"
          width={64}
          height={64}
          className="absolute top-[30%] right-[10%] w-12 h-12 md:w-16 md:h-16"
        /> */}

        <div className="max-w-3xl px-4 space-y-5 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Find your StudyBuddies!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            With a <span className="font-bold">QUICK</span> scan of your schedule, meet your class members!
          </p>
          <div>
            <Link to="/register">
              <Button className="bg-northeasternRed text-white hover:bg-northeasternRed/darker text-lg px-8 py-6 rounded-full shadow-lg transition-transform transform hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>
      {/* Placeholder for the bottom section, similar to the image's dashboard glimpse */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Connect with your classmates
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Scan your schedule, explore profiles, and find study partners!
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-4xl rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <video
              className="w-full h-auto"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200 bg-white">
        <p className="text-xs text-muted-foreground">

        </p>
      </footer>
    </div>
  )
}
