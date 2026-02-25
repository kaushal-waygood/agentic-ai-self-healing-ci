import Image from 'next/image';

export const Loader = ({
  message = 'LOADING',
  fullHeight = false,
  classStyle = '',
  imageClassName = 'w-8 h-8',
  textClassName = 'text-lg',
}: {
  message?: string;
  classStyle?: string;
  fullHeight?: boolean;
  imageClassName?: string;
  textClassName?: string;
}) => {
  return (
    <div
      className={`flex flex-col justify-center items-center ${
        fullHeight ? 'h-full min-h-[200px]' : 'py-20'
      } ${classStyle}`}
    >
      <div>
        <Image
          src="/logo.png"
          alt=""
          className={`animate-bounce ${imageClassName}`}
          width={100}
          height={100}
        />
      </div>

      <div className={`${textClassName}`}>{message} ...</div>
    </div>
  );
};
