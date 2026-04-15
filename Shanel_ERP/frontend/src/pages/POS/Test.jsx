import React from 'react'
import { useMemo } from 'react';

const Test = ({ cartItems }) => {
  
   const calculateTotal =  useMemo(() =>{
    const items = Array.isArray(cartItems) ? cartItems : [];
    return items.reduce((sum, item) => sum + item.total, 0)}, [cartItems]);
   //useMemo used to optimize performance by memoizing the calculated total, so it only recalculates when cartItems change.
  return (
    
    <div>
    
         <p >Total: Rs. {calculateTotal}</p>;
     
    </div>
  )
}

export default Test
