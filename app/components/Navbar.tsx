export default function Navbar() {
  return (
    <nav className="max-w-7xl mx-auto flex justify-between items-center py-8 px-10">

      <div>
        <h1 className="text-3xl font-bold text-[#5A432C]">
          NIDDLE
        </h1>
      </div>

      <ul className="flex gap-10 text-lg">
        <li>Home</li>
        <li>Services</li>
        <li>Pricing</li>
        <li>Contact</li>
        <li>Login</li>
      </ul>

    </nav>
  );
}