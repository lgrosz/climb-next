"use client";

import { TopoSessionProvider, useTopoSession } from "@/components/context/TopoSession";
import { TopoWorld, TopoWorldProvider } from "@/components/context/TopoWorld";
import TopoEditor from "@/components/TopoEditor/TopoEditor";
import { TopoChange } from "@/hooks/useTopoHistory";
import { title } from "@/topos/actions";
import { useParams } from "next/navigation";
import { useCallback } from "react";

function EditTopoClientInner({
  id,
}: {
  id: string,
}) {
  const { changes } = useTopoSession();

  const changeToAction = useCallback((change: TopoChange) => {
    const action = change.action;

    switch (action.type) {
      case "title":
        return () => title(id, action.title)
    }

    return async () => {
      console.log("Will not apply", change);
    };
  }, [id]);

  const finish = useCallback(async () => {
    const actions = changes
      .map(changeToAction);

    for (const action of actions) {
      await action();
    }
  }, [changes, changeToAction]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <TopoEditor onFinish={finish} />
    </div>
  );
}

export default function EditTopoClient({
    availableClimbs,
    world,
}: {
    availableClimbs: {
        id: string,
	name: string,
    }[],
    world: TopoWorld,
}) {
  const { id } = useParams<{ id: string }>();

  return (
    <TopoWorldProvider initial={world}>
      <TopoSessionProvider availableClimbs={availableClimbs} >
        <EditTopoClientInner id={id} />
      </TopoSessionProvider>
    </TopoWorldProvider>
  );
}

