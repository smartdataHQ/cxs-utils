import React from 'react';
import Link from 'next/link';
import Image from 'next/image'
import '../public/context-suite-logo.svg'

export function TopNav({children}) {
  return (
    <nav>
      <Link href="/" className="flex">
          <Image src={"/context-suite-logo.svg"} alt="Context Suite" width={150} height={30} />
      </Link>
      <section>{children}</section>
      <style jsx>
        {`
          nav {
            top: 0;
            position: fixed;
            width: 100%;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 1rem 2rem;
            background: white;
            border-bottom: 1px solid var(--border-color);
          }
          nav :global(a) {
            text-decoration: none;
          }
          section {
            display: flex;
            gap: 1rem;
            padding: 0;
          }
        `}
      </style>
    </nav>
  );
}
