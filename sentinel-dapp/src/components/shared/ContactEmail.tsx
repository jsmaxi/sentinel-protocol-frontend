"use client";

import Link from "next/link";

const email = "sentineldefi@gmail.com";

const ContactEmail = () => {
  return <Link href={`mailto:${email}`}>Contact</Link>;
};

export default ContactEmail;
