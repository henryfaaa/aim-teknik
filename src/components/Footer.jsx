export default function Footer() {
  return (
    <footer className="bg-white text-center py-3 text-xs md:text-sm border-t text-gray-500">
      © {new Date().getFullYear()} CV. AIM Teknik — All rights reserved.
    </footer>
  );
}