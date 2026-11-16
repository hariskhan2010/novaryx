import { ProjectEditor } from "@/components/admin/ProjectEditor";

export default function NewProject() {
  return (
    <>
      <h1 className="stretch mb-8 text-4xl font-extrabold sm:text-5xl">Upload project</h1>
      <ProjectEditor />
    </>
  );
}
