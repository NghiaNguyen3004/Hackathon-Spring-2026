import PostCard from "../PostCard/PostCard"
const requestList =[
    {name: "Nghia", content: "Lorem ipsum"},
    {name: "Evelyn", content: "Lorem ipsum"}
]

export default function RequestList(){
    return(
        <div>
            {requestList.map((reqList) =>(
            <PostCard
            username = {reqList.name}
            content = {reqList.content}
            />)) }
        </div>

    )
}