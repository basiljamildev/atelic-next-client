"use client";

import React, { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import { useScroll } from "framer-motion";
import { fetchPartnersPageData } from "@/lib/api/partners";
import { fetchUpdatedAt } from "@/lib/updatedAt";
import { useLoader } from "@/context/useLoader";

// Components
import Footer from "@/components/Footer/Footer";
import { Partners } from "@/components/Partners/Partners";
import Differentiation from "@/components/PartnersSection/Differentiation";
import PartnersHero from "@/components/PartnersSection/PartnersHero";
import Specialism from "@/components/PartnersSection/Specialism";
import Loader from "@/components/Loader/Loader";
import SVGComponent from "@/components/Svg";
import RegionalPartners from "@/components/PartnersSection/RegionalPartners";
import { useBackground } from "@/context/BackgroundContext";

const partners = () => {
  const container = useRef();
  const [sections, setSections] = useState([]);

  const { setLoading, setIsCached, setDataFetched, dataFetched } = useLoader();
  const { setIsDark, isDark, setSlideProgress } = useBackground();
  let cached = null;

  const getPageSections = async () => {
    const latestUpdatedAt = await fetchUpdatedAt("partners");
    const cachedPage = cached?.content?.data?.[0];

    if (!cached || cachedPage?.updatedAt !== latestUpdatedAt) {
      try {
        setLoading(true);
        const res = await fetchPartnersPageData();
        const fetchedSections = res?.data?.[0]?.section || [];
        setSections(fetchedSections);
      } catch (err) {
        console.error("Error loading partners data:", err);
        if (cached?.content?.data?.[0]?.section) {
          setSections(cached.content.data?.[0].section);
        }
      } finally {
        setLoading(false);
        setDataFetched(true);
      }
    }
  };

  useEffect(() => {
    const lenis = new Lenis();
    // setIsDark(false);
    setIsDark(false);
    setSlideProgress(0);
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, [isDark]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        cached = JSON.parse(localStorage.getItem("partners") || "null");
      } catch (e) {
        console.warn("Error parsing cache:", e);
      }

      if (cached?.content?.data?.[0]?.section) {
        setSections(cached.content.data?.[0].section);
        setIsCached(true);
        setDataFetched(true);
      }
    }

    getPageSections();
  }, []);

  const hero = sections?.find(
    (sec) => sec?.__component === "shared.hero-container"
  );
  const partnersData = sections?.find(
    (sec) => sec?.__component === "shared.global-partners"
  );
  const differentiation = sections?.find(
    (sec) => sec?.__component === "shared.services-solutions"
  );
  const specialism = sections?.find(
    (sec) => sec?.__component === "shared.partners-speciality"
  );
  if (!dataFetched) {
    return <Loader />;
  }
  return (
    <div ref={container}>
      <PartnersHero sections={hero} />
      <Specialism sections={specialism} />
      <Partners data={partnersData} partners={true} />
      <RegionalPartners />
      <Differentiation sections={differentiation} />
      <Footer />
    </div>
  );
};

export default partners;
