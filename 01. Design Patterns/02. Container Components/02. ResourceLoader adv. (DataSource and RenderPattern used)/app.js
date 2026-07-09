import axios from "axios";
import { DataSourceWithRenderProps } from "./components/data-source-with-render-props";
import { UserInfo } from "./components/user-info";

const fetchData = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

function App() {
  return (
    <>
      <DataSourceWithRenderProps
        getData={() => fetchData("/users/1")}
        render={(resource) => <UserInfo user={resource} />}
      ></DataSourceWithRenderProps>
    </>
  );
}

export default App;
