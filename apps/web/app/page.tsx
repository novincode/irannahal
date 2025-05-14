import Image from "next/image";
import { Button } from "@shadcn/button";
export default function Home() {
  return (
    <div>
      <Button>
        {process.env.DATABASE_URL}
      </Button>
    </div>
  );
}
