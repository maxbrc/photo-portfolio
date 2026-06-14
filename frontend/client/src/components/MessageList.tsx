import { MessageBadge } from "../types/messages";

import "../styles/message_list.css";

function MessageList({ messages }: { messages: MessageBadge[] }) {
    return (
        <div
            className="error-list"
        >
            {
                messages.map(el => {
                    return (
                        <div
                            key={el.uuid}
                            className={el.type}
                        >
                            <div className="icon">
                                <img src={`/assets/toast-${el.type}.svg`}/>
                            </div>
                            {el.message}
                        </div>
                    )
                })
            }
        </div>
    )
}

export default MessageList