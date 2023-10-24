import styled from "styled-components";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Checkbox from "../../ui/Checkbox";
import Input from "../../ui/Input";
import Spinner from "../../ui/Spinner";
import { useCabins } from "../cabins/useCabins";
import { useGuests } from "../../hooks/useGuests";
import { useState } from "react";
import { differenceInDays, isBefore, isDate, startOfToday } from "date-fns";
import { useForm } from "react-hook-form";
import { useSettings } from "../settings/useSettings";
import toast from "react-hot-toast";
import { useCreateBooking } from "./useCreateBooking";
import { useNavigate } from "react-router-dom";

const StyledSelect = styled.select`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  padding: 0.8rem 1.2rem;
`;

function CreateBookingForm() {
  const [wantBreakfast, setWantBreakfast] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const { cabins, isLoading: isLoadingCabins } = useCabins();
  const { guests, isLoading: isLoadingGuests } = useGuests();
  const { settings, isLoading: isLoadingSettings } = useSettings();
  const { createBooking, isCreating } = useCreateBooking();

  function onSubmit(data) {
    const numNights = differenceInDays(
      new Date(data.endDate),
      new Date(data.startDate)
    );

    const today = startOfToday();

    if (numNights < 1) {
      toast.error("Start date must be before end date");
      return;
    }

    if (numNights < settings.minBookingLength) {
      toast.error(
        `Minimum number of nights must be ${settings.minBookingLength}`
      );
      return;
    }

    if (numNights > settings.maxBookingLength) {
      toast.error(
        `Minimum number of nights must be ${settings.maxBookingLength}`
      );
      return;
    }

    if (isBefore(new Date(data.startDate), today)) {
      toast.error("You can't start a booking before today");
      return;
    }

    const selectedCabin = cabins
      .filter((cabin) => cabin.id === Number(data.cabinId))
      .at(0);

    const cabinPrice =
      (selectedCabin.regularPrice - selectedCabin.discount) * numNights;

    const extrasPrice = wantBreakfast
      ? settings.breakfastPrice * numNights * data.numGuests
      : 0;

    const totalPrice = cabinPrice + extrasPrice;

    const newBooking = {
      ...data,
      cabinPrice,
      extrasPrice,
      totalPrice,
      isPaid,
      numNights,
      cabinId: Number(data.cabinId),
      numGuests: Number(data.numGuests),
      guestId: Number(data.guestId),
      hasBreakfast: wantBreakfast,
      status: "unconfirmed",
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };

    createBooking(newBooking, {
      onSuccess: () => navigate("/bookings"),
    });
  }

  if (isLoadingCabins || isLoadingGuests || isLoadingSettings)
    return <Spinner />;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Start date" error={errors?.startDate?.message}>
        <Input
          type="date"
          id="startDate"
          disabled={isCreating}
          {...register("startDate", {
            required: "This field is required",
            validate:
              isDate(getValues().startDate) || "You must choose a valid date",
          })}
        />
      </FormRow>

      <FormRow label="End date" error={errors?.endDate?.message}>
        <Input
          type="date"
          id="endDate"
          disabled={isCreating}
          {...register("endDate", {
            required: "This field is required",
            validate:
              isDate(getValues().endDate) || "You must choose a valid date",
          })}
        />
      </FormRow>

      <FormRow label="Number of guests" error={errors?.numGuests?.message}>
        <Input
          type="text"
          id="numGuests"
          disabled={isCreating}
          min={1}
          defaultValue={1}
          {...register("numGuests", {
            required: "This field is required",
            min: {
              value: 1,
              message: "Minimum number of guests must be 1",
            },
            max: {
              value: settings.maxGuestsPerBooking,
              message: `Max number of guests must be ${settings.maxGuestsPerBooking}`,
            },
          })}
        />
      </FormRow>

      <FormRow label="Select cabin">
        <StyledSelect
          id="cabinId"
          {...register("cabinId")}
          disabled={isCreating}
        >
          {cabins?.map((cabin) => (
            <option key={cabin.id} value={cabin.id}>
              {cabin.name}
            </option>
          ))}
        </StyledSelect>
      </FormRow>

      <FormRow label="Select guest">
        <StyledSelect
          id="guestId"
          {...register("guestId")}
          disabled={isCreating}
        >
          {guests?.map((guest) => (
            <option key={guest.id} value={guest.id}>
              {guest.fullName}
            </option>
          ))}
        </StyledSelect>
      </FormRow>

      <FormRow label="Observations">
        <Input
          type="text"
          id="observations"
          {...register("observations")}
          disabled={isCreating}
        />
      </FormRow>

      <FormRow>
        <Checkbox
          id="breakfast"
          onChange={() => setWantBreakfast((cur) => !cur)}
          disabled={isCreating}
        >
          I want breakfast with my booking
        </Checkbox>
      </FormRow>

      <FormRow>
        <Checkbox
          id="isPaid"
          onChange={() => setIsPaid((cur) => !cur)}
          disabled={isCreating}
        >
          This booking is paid
        </Checkbox>
      </FormRow>

      <FormRow>
        <Button variation="secondary" type="reset" disabled={isCreating}>
          Cancel
        </Button>
        <Button disabled={isCreating}>Add booking</Button>
      </FormRow>
    </Form>
  );
}

export default CreateBookingForm;
