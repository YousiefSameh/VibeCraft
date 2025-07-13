import Navbar from "@/modules/home/components/ui/Navbar";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <main className="flex flex-col min-h-screen max-h-screen">
      <Navbar />
      <div className="absolute inset-0 -z-10 h-full w-full dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)] bg-[radial-gradient(#dadde2_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="flex-1 flex flex-col px-4 pb-4">
        {children}
      </div>
    </main>
  )
}

export default Layout