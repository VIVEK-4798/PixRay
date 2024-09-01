import React from 'react';
import {ThreeDots} from 'react-loader-spinner';

const Spinner = ({message}) => {
  return (
    <div className='flex flex-col justify-center items-center w-full h-full'>
        <ThreeDots
          type="Circles"
          color="#00BFFF"
          heigth={50}
          width={100}
          className="m-5"
        />
        <p className='text-lg text-center px-2'>{message}</p>
    </div>
  )
}

export default Spinner