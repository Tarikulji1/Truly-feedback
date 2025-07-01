'use client';
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import messages from "@/messages.json";

function Home() {
  return (
    <>
    <main className="flex flex-grow flex-col items-center justify-center px-4 md:px-24 py-12">
      <section className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold">
          Dive into the world of anonymous conversations
        </h1>
        <p className="mt-3 md:mt-4 text-base md:text-lg">
          Explore Mystery Message - Where your identity remains a secret.
        </p>
      </section>
      <Carousel 
      plugins={[Autoplay({delay: 2000})]}
      className="w-full max-w-xs md:max-w-lg lg:max-w-2xl">
      <CarouselContent>
        {
        Array.isArray(messages) && messages.map((message, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardHeader>
                  {message.title}
                </CardHeader>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-lg font-semibold">{message.content}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious aria-label="Previous message" />
      <CarouselNext aria-label="Next message" />
    </Carousel>
    </main>
    <footer className="text-center p-4 md:p-6">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Truly-Feedback. All rights reserved.
      </p>
    </footer>
    </>
  );
}

export default Home;
