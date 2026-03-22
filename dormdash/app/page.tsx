import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
 
      {/* Logo & Tagline */}
      <div className="text-center mb-10">
        <h1 className="text-8xl font-black tracking-md text-red-500 uppercase bebas-neue-regular">
          DormDash
        </h1>
        <p className="text-xs font-bold tracking-l text-black uppercase">
          Ask your friend to clean your room
        </p>
      </div>

      {/*Gif */}
      <div className = "mb-12">
        <div className ="flex items-end gap-2">
          <Image src = "/courier.gif" alt = "" width = {350} height = {250}
          unoptimized={true}/>
        </div>
      </div>
 
      {/* Buttons */}
      <div className="flex gap-5 w-full max-w-sm">
        <Link
          href="/signup"
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-3 text-center transition-colors duration-200 rounded-md"
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-semibold py-3 text-center transition-colors duration-200 rounded-md"
        >
          Log In
        </Link>
      </div>
 
    </main>
  );
}
