import axios from "axios";
import { BookInfo } from "./components/book-info";
import { UserInfo } from "./components/user-info";

function App() {
    return (
        <>
            <ResourceLoader resourceUrl={"/users/1"} resourceName={"user"}>
                <UserInfo />
            </ResourceLoader>

            <ResourceLoader resourceUrl={"/books/1"} resourceName={"book"}>
                <BookInfo />
            </ResourceLoader>
        </>
    );
}

export default App;
