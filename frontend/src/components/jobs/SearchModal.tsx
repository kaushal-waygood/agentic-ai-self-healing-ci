import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const SearchModal = ({ handleSearchInput }) => {
  const handleFilterChange = (name: string, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <div>
      <div className="w-full max-w-md">
        <div>
          <Input
            placeholder="Search jobs..."
            value={filters.query}
            onChange={handleSearchInput}
          />
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="Country"
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="City"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          />
        </div>

        <div>
          <Select
            value={filters.datePosted}
            onValueChange={(value) => handleFilterChange('datePosted', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date posted" />
            </SelectTrigger>
            <SelectContent>
              {datePostedOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
