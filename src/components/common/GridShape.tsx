export default function GridShape() {
  return (
    <>
      <div className="absolute right-0 top-0 -z-1 w-[250px] xl:w-[450px]">
        <img src="/images/shape/grid-01.svg" alt="grid" className="w-full" />
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-[250px] xl:w-[450px] rotate-180">
        <img src="/images/shape/grid-01.svg" alt="grid" className="w-full" />
      </div>
    </>
  );
}
