import { useOutletContext } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { collection, getFirestore, orderBy, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import CategoriesList from "./categories/CategoriesList";
import Loading from "../../../reusable-components/Loading"
import Error from "../../../reusable-components/Error";
import MessagesList from "./messages/MessagesList";

export default function LiveChat({ categoriesList }) {
  const context = useOutletContext();
  const app = context?.app;

  const [categoryId, setCategoryId] = useState(categoriesList[0].id);
  const [chatHeader, setChatHeader] = useState(categoriesList[0].unicode + " " + categoriesList[0].title);

  const messagesListDb = collection(getFirestore(app), "messagesList");
  const [messagesListCollection, loading, error] = useCollection(query(messagesListDb, where("categoryId", "==", categoryId), orderBy("timestamp")));
  const messagesList = messagesListCollection?.docs?.map((doc) => {
    return { id: doc.id, ...doc.data() }
  });

  const categoriesBtnRef = useRef();
  const cateogiresListRef = useRef();
  const messagesListRef = useRef();
  const toggleShowCategories = () => {
    if (cateogiresListRef?.current?.classList?.contains("hidden")) {
      cateogiresListRef.current.classList.remove("hidden");
      cateogiresListRef.current.classList.add("flex");
      messagesListRef?.current?.classList?.remove("flex");
      messagesListRef?.current?.classList?.add("hidden");
    } else {
      cateogiresListRef.current.classList.remove("flex");
      cateogiresListRef.current.classList.add("hidden");
      messagesListRef?.current?.classList?.remove("hidden");
      messagesListRef?.current?.classList?.add("flex");
    }
  }
  useEffect(() => {
    toggleShowCategories();
  }, []);

  return (
    <>
      <div ref={cateogiresListRef} className="relative flex sm:flex flex-col col-span-4 sm:col-span-1 overflow-y-hidden">
        <CategoriesList categoriesList={categoriesList} setCategoryId={setCategoryId} setChatHeader={setChatHeader} toggleShowCategories={toggleShowCategories} />
      </div>

      <div ref={messagesListRef} className="relative hidden sm:flex flex-col col-span-4 sm:col-span-3 overflow-y-scroll scrollbar-fancy rounded-l-xl rounded-r-md bg-black bg-opacity-5">
        <div className="sticky top-0 py-4 sm:py-6 backdrop-blur-sm">
          <button ref={categoriesBtnRef} onClick={toggleShowCategories} className="w-fit ml-6 p-0 visible sm:hidden">≡</button>
          <h1 className="w-[87%] inline-block">{chatHeader}</h1>
        </div>
        {loading && <Loading wrapperClassNameToAdd="my-auto" />}
        {error && <Error error={error} wrapperClassName="my-auto" />}
        {!loading && !error && messagesList.length === 0 && <p className="my-auto font-bold text-center text-accent">There are no messages for this category yet. Be the first to leave a new one!</p>}
        {!loading && !error && messagesList.length > 0 && <MessagesList categoryId={categoryId} messagesList={messagesList} messagesListRef={messagesListRef} messagesListDb={messagesListDb} />}
      </div>
    </>
  );
}
