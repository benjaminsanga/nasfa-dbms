"use client"
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import PDFDocument from "@/components/PDFComponent";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { supabase } from "@/lib/supabase";
import { Result } from "@/types/admin";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LoaderIcon } from "react-hot-toast";

const columns = [
  { header: "Subjects Count", accessor: "name" },
  { header: "Student", accessor: "student" },
  { header: "Student ID", accessor: "student_id", className: "hidden md:table-cell" },
  { header: "Avg. Score", accessor: "score", className: "hidden md:table-cell" },
  { header: "Date", accessor: "date", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "action" },
];

const ResultListPage = () => {
  const [view, setView] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [uniqueStudents, setUniqueStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({ studentId: "", department: "", year: "" });

  useEffect(() => {
    const processedStudents = Object.values(
      results.reduce((acc: Record<string, any>, item) => {
        const studentId = item.student_id || "";
        if (!acc[studentId]) {
          acc[studentId] = {
            courses_count: 0,
            first_name: item.first_name,
            last_name: item.last_name,
            student_id: item.student_id,
            score: 0,
            created_at: item.created_at,
            department: item.department,
            academic_session: item.academic_session,
            semester: item.semester,
            total_score: 0,
            course: item.course,
          };
        }
        acc[studentId].courses_count += 1;
        acc[studentId].total_score += item.score;
        acc[studentId].score = acc[studentId].total_score / acc[studentId].courses_count;
        return acc;
      }, {} as Record<string, any>)
    );
    setUniqueStudents(processedStudents);
  }, [results]);

  useEffect(() => {
    const fetchAllResults = async (): Promise<Result[]> => {
      const { data, error } = await supabase.from("long_course_results").select("*");
      if (error) {
        console.error("Error fetching students:", error.message);
        return [];
      }
      return data as Result[];
    };

    const loadResults = async () => {
      const result = await fetchAllResults();
      setResults(result);
    };

    loadResults();
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  const applyFilters = () => {
    const { studentId, department, year } = filters;
    const filtered = results.filter((student) => {
      const matchesStudentId = studentId ? student?.student_id?.includes(studentId) : true;
      const matchesDepartment = department ? student.department.includes(department) : true;
      const matchesYear = year ? new Date(student.created_at).getFullYear().toString() === year : true;
      return matchesStudentId && matchesDepartment && matchesYear;
    });
    const processedFilteredStudents = Object.values(
      filtered.reduce((acc: Record<string, any>, item) => {
        const studentId = item.student_id || "";
        if (!acc[studentId]) {
          acc[studentId] = {
            courses_count: 0,
            first_name: item.first_name,
            last_name: item.last_name,
            student_id: item.student_id,
            score: 0,
            created_at: item.created_at,
            department: item.department,
            academic_session: item.academic_session,
            semester: item.semester,
            total_score: 0,
            course: item.course,
          };
        }
        acc[studentId].courses_count += 1;
        acc[studentId].total_score += item.score;
        acc[studentId].score = acc[studentId].total_score / acc[studentId].courses_count;
        return acc;
      }, {} as Record<string, any>)
    );
    setUniqueStudents(processedFilteredStudents);
  };

  const clearFilters = () => {
    setFilters({ studentId: "", department: "", year: "" });
    const processedStudents = Object.values(
      results.reduce((acc: Record<string, any>, item) => {
        const studentId = item.student_id || "";
        if (!acc[studentId]) {
          acc[studentId] = {
            courses_count: 0,
            first_name: item.first_name,
            last_name: item.last_name,
            student_id: item.student_id,
            score: 0,
            created_at: item.created_at,
            department: item.department,
            academic_session: item.academic_session,
            semester: item.semester,
            total_score: 0,
            course: item.course,
          };
        }
        acc[studentId].courses_count += 1;
        acc[studentId].total_score += item.score;
        acc[studentId].score = acc[studentId].total_score / acc[studentId].courses_count;
        return acc;
      }, {} as Record<string, any>)
    );
    setUniqueStudents(processedStudents);
  };

  const filteredStudents = uniqueStudents.filter((student) => {
    return (
      student.first_name.toLowerCase().includes(searchQuery) ||
      student.last_name.toLowerCase().includes(searchQuery) ||
      student.student_id.toLowerCase().includes(searchQuery)
    );
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Long Course Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch onChange={handleSearchChange} />
          <div className="flex items-center gap-4 self-end">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
              onClick={() => setFilterModalOpen(true)}
            >
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <FormModal table="result" type="create" />
          </div>
        </div>
      </div>

      {filterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Apply Filters</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">Student ID</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={filters.studentId}
                  onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                  placeholder="Enter Student ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Department</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  placeholder="Enter Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Year</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  placeholder="Enter Year"
                />
              </div>
            </div>
            <div className="flex items-center justify-end mt-4 gap-4">
              <button
                className="px-4 py-2 text-sm bg-gray-300 rounded"
                onClick={() => setFilterModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-lamaYellow rounded"
                onClick={() => {
                  applyFilters();
                  setFilterModalOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Table columns={columns} renderRow={(item) => (
        <tr key={item.student_id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
          <td className="flex items-center gap-4 p-4">{item.courses_count}</td>
          <td>{item.first_name} {item.last_name}</td>
          <td className="hidden md:table-cell">{item.student_id}</td>
          <td className="hidden md:table-cell">{item.score}</td>
          <td className="hidden md:table-cell">{new Date(item.created_at).toDateString()}</td>
        </tr>
      )} data={filteredStudents} />

      <Pagination />
      <button
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
        onClick={clearFilters}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default ResultListPage;