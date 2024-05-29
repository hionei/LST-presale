import Home from "./pages/Home";
import Layout from "./layouts/Layout";
import "./App.css";

function App() {
  return (
    <>
      <div className="background"></div>
      <Layout>
        <Home />
      </Layout>
    </>
  );
}

export default App;
