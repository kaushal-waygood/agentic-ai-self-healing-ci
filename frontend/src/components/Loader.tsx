import Image from 'next/image';

export const Loader = ({
  message = 'LOADING...',
  classStyle = '',
}: {
  message?: string;
  classStyle?: string;
}) => {
  return (
    <div
      className={`flex flex-col justify-center items-center py-20 ${classStyle}`}
    >
      <div>
        <Image
          src="/logo.png"
          alt=""
          className="w-10 h-10 animate-bounce"
          width={100}
          height={100}
        />
      </div>

      <div className="text-lg">{message} ...</div>
    </div>
  );
};
