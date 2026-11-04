import { component$, useContextProvider, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

import Navbar from '~/components/furniture/nav';
import Footer from '~/components/furniture/footer';
import { ChecklistContext } from '~/store/checklist-context';
import checklistData from '~/data/checklist';

export const useChecklists = routeLoader$(() => checklistData);

export default component$(() => {
  const checklists = useChecklists();
  useContextProvider(ChecklistContext, checklists);

  return (
    <>
      <Navbar />
      <main class="bg-base-100 min-h-full">
        <Slot />
      </main>
      <Footer />
    </>
  );
});
