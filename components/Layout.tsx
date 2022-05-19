import Footer from "./Footer";
import Header from "./Header";

type Props = {
  children: JSX.Element
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </>
  )
}

export default Layout