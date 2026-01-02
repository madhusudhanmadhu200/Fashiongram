import { useParams } from "react-router-dom";
import Profile from "./Profile";

export default function ProfileWrapper() {
    const { id } = useParams();
    return <Profile userId={ id } />;
}
