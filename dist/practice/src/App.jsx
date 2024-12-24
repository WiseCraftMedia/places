import { useState, useEffect } from "react";
import "./App.css";
import { AVAILABLE_PLACES } from "./data.js";
import { v4 as uuid } from "uuid";
import { styled } from "styled-components";

function App() {
  const [places, setPlaces] = useState({
    stock: AVAILABLE_PLACES,
    wishlist: []
  });

  const { stock, wishlist } = places;

  function addWishlist(item) {
    setPlaces(prev => {
      // if item is already on wishlist, return prev
      const maybeDupe = prev.stock.find(stock => stock.id === item.id);
      const exists = prev.wishlist.find(wish => wish.id === maybeDupe.id);
      if (exists) {
        return {
          ...prev
        };
      }

      const wishlist = [...prev.wishlist, item];
      const wishString = JSON.stringify(wishlist);
      localStorage.setItem("wishString", wishString);

      return {
        ...prev,
        wishlist
      };
    });
  }

  function deleteWishlist(id) {
    setPlaces(prev => {
      const wishlist = [...prev.wishlist];

      const newWishlist = wishlist.filter(wish => wish.id !== id);
      const wishString = JSON.stringify(newWishlist);
      localStorage.setItem("wishString", wishString);

      return {
        ...prev,
        wishlist: newWishlist
      };
    });
  }

  function success(position) {
    ogloc(position.coords);
  }

  function here() {
    navigator.geolocation.getCurrentPosition(success);
  }

  function ogloc(coords) {
    const { latitude: latA, longitude: lonA } = coords;

    stock = AVAILABLE_PLACES.map(place => {
      const { lat: latB, lon: lonB, title, image } = place;

      const latC = latA - latB;
      const longC = lonA - lonB;

      const distSq = Math.pow(latC, 2) + Math.pow(longC, 2);
      return { title, distSq, image };
    });
    stock.sort((a, b) => a.distSq - b.distSq);
    setPlaces(prev => {
      // Destructure the current state
      const { stock, wishlist } = prev;

      // Filter out stock items that exist in the wishlist
      const updatedStock = stock.filter(
        stockItem => !wishlist.some(wish => wish.title === stockItem.title)
      );

      // Return a new state with the updated stock
      return { ...prev, stock: updatedStock };
    });
  }

  useEffect(() => {
    const wishString = localStorage.getItem("wishString");
    setPlaces(prev => {
      return {
        ...prev,
        wishlist: JSON.parse(wishString)
      };
    });
  }, []);

  return (
    <>
      <div id="button">
        <button onClick={here}>Gimme Yo' Location</button>
      </div>
      <main>
        <div id="places">
          {stock.map(item => {
            return (
              <button id={item.id} onClick={() => addWishlist(item)}>
                {item.title}
              </button>
            );
          })}
        </div>
        <div id="wishlist">
          {wishlist.map(item => {
            return (
              <button id={item.id} onClick={() => deleteWishlist(item.id)}>
                {item.title}
              </button>
            );
          })}
        </div>
      </main>
    </>
  );
}

export default App;
