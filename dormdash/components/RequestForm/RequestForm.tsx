import { useState } from "react";

export default function RequestForm() {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');

    return(
        <div>
            <form>
            <input value = {name}
            onChange={(e) => setName(e.target.value)}
            placeholder = " What is your name?"
            />

            <input value = {content}
            onChange={(e) => setContent(e.target.value)}
            placeholder = " What do you need help with?"
            />

            <button type = "button">Submit</button>
            </form>
        </div>
        
    )
}