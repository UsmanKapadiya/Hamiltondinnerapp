import RoomEnterView from "./RoomLoginController";
import useRoomEnterLogic from "./useRoomLogin";

const RoomEnter = () => {
  const props = useRoomEnterLogic();
  return <RoomEnterView {...props} />;
};

export default RoomEnter;
